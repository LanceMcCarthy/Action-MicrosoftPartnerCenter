import * as core from '@actions/core'
import {BlockBlobClient} from '@azure/storage-blob'
import {DevCenter} from 'partner-center-broker'

export async function run(): Promise<void> {
  const tenantId = core.getInput('tenant_id')
  const clientId = core.getInput('client_id')
  const clientSecret = core.getInput('client_secret')
  const appId = core.getInput('app_id')
  const packageFile = core.getInput('package_file')
  const deletePendingSubmissions =
    core.getInput('delete_pending_submissions').toLowerCase() == 'true'
  const failIfUnsuccessful =
    core.getInput('fail_if_unsuccessful').toLowerCase() == 'true'

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

  let devCenter = new DevCenter(tenantId, clientId, clientSecret)

  const appInfo = await devCenter.GetAppInfo(appId)

  core.info(`"Retrieved information for:  ${appInfo.primaryName}" application...`)

  // Check for pending submissions
  const pendingSubmission =
    appInfo.pendingApplicationSubmission === null ? true : false

  core.info(`"Submission pending? ${pendingSubmission}"`)

  // If desired, delete the pending submissions
  if (deletePendingSubmissions && pendingSubmission) {
    const successfulDelete = await devCenter.DeleteSubmission(
      appInfo.id,
      appInfo.pendingApplicationSubmission.id
    )

    core.info(`"Pending submission deleted?  ${successfulDelete}"`)
  }

  const createSubmissionResult = await devCenter.CreateAppSubmission(appId)

  core.info(`"Request new submission: ${createSubmissionResult.status}"`)

  try {
    core.info('Uploading package file...')

    // with an SAS upload URL, we can now upload the appxupload/msixupload file.
    await new BlockBlobClient(createSubmissionResult.fileUploadUrl).uploadFile(
      packageFile
    )

    core.info('Upload complete!')
  } catch (ex) {
    core.error(`"SAS Upload Error: ${ex}"`)
    throw console.error(`"SAS Upload Error: ${ex}"`)
  }

  core.info('Committing submission...: ')

  // Commit
  const commitResult = await devCenter.CommitSubmission(
    appId,
    createSubmissionResult.id
  )

  core.info(`"Submission committed: ${commitResult.status}"`)

  if (failIfUnsuccessful) {
    if (
      commitResult.status === 'CommitFailed' ||
      commitResult.status === 'PublishFailed' ||
      commitResult.status === 'PreProcessingFailed' ||
      commitResult.status === 'CertificationFailed' ||
      commitResult.status === 'ReleaseFailed'
    ) {
      core.error(commitResult.status)
      core.setFailed(
        'There was a problem with the app submission, see output errors for more details.'
      )
    }
  }

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

run().catch(e => {
  core.debug(e.stack)
  core.error(e.message)
  core.setFailed(e.message)
})
