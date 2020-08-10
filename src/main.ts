import * as core from '@actions/core'
import * as partnerCenter from './partnerCenter'

// Store API Upload endpoint https://manage.devcenter.microsoft.com
// Azure Tenant ID
// Client ID
// Client Secret
// DeletePending submissions (Whether to delete an existing submission instead of failing the task)
// AppId (ID of the application, found in the URL for the application's page on the Dev Center)
// PackageFile (Path to the application's package (appxupload/msixupload) you want to flight.)
// MandatoryUpdate (Indicates whether you want to treat the packages in this submission as mandatory for self-installing app updates.)
// MandatoryUpdateHours (The number of hours until packages become mandatory)

export async function run(): Promise<void> {
  const tenantId = core.getInput('tenant_id')
  const clientId = core.getInput('client_id')
  const clientSecret = core.getInput('client_secret')
  const appId = core.getInput('app_id')
  const packageFile = core.getInput('package_file')
  const deletePendingSubmissions =
    core.getInput('delete_pending_submissions').toLowerCase() == 'true'
  const mandatoryUpdate =
    core.getInput('mandatory_update').toLowerCase() == 'true'
  const mandatoryUpdateHours = Number(core.getInput('mandatory_update_hours'))

  if (tenantId === '') {
    throw new Error('The tenantId cannot be empty.')
  }
  if (clientId === '') {
    throw new Error('The clientId cannot be empty.')
  }
  if (clientSecret === '') {
    throw new Error('The clientSecret cannot be empty.')
  }
  if (appId === '') {
    throw new Error('The appId cannot be empty.')
  }
  if (packageFile === '') {
    throw new Error('The packageFile cannot be empty.')
  }

  // 1. Authenticate
  const authResult = await partnerCenter.authenticate(
    tenantId,
    clientId,
    clientSecret
  )
  const auth = 'Bearer ' + authResult.access_token

  // Get the application's info
  const appInfo = await partnerCenter.getAppResourceInfo(auth, appId)

  // Check for pending submissions
  const pendingSubmission =
    appInfo.pendingApplicationSubmission === null ? true : false

  // If desired, delete the pending submissions
  if (deletePendingSubmissions && pendingSubmission) {
    await partnerCenter.deleteSubmission(
      auth,
      appInfo.id,
      appInfo.pendingApplicationSubmission.id
    )
  }

  // Create a new submission
  const createSubResult = await partnerCenter.createAppSubmission(auth, appId)
  const submissionId = createSubResult.id

  // TODO need to figure out how to attach package file to submission.

  // Commit
  const commitResult = await partnerCenter.commitSubmission(
    auth,
    appId,
    submissionId
  )

  // possible result messages for commitResult.status
  // None
  // Canceled
  // PendingCommit
  // CommitStarted
  // CommitFailed
  // PendingPublication
  // Publishing
  // Published
  // PublishFailed
  // PreProcessing
  // PreProcessingFailed
  // Certification
  // CertificationFailed
  // Release
  // ReleaseFailed

}

// Showtime!
run().catch(e => {
  core.debug(e.stack)
  core.error(e.message)
  core.setFailed(e.message)
})
