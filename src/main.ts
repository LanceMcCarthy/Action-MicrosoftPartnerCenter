import * as core from '@actions/core'
import { BlockBlobClient } from '@azure/storage-blob'
import * as partnerCenter from './partnerCenter'

export async function run(): Promise<void> {
  const tenantId = core.getInput('tenant_id');
  const clientId = core.getInput('client_id');
  const clientSecret = core.getInput('client_secret');
  const appId = core.getInput('app_id');
  const packageFile = core.getInput('package_file');
  const deletePendingSubmissions = core.getInput('delete_pending_submissions').toLowerCase() == 'true';
  const failIfUnsuccessful = core.getInput('fail_if_unsuccessful').toLowerCase() == 'true';

  if (tenantId === '') {
    throw new Error('The tenantId cannot be empty.');
  }
  if (clientId === '') {
    throw new Error('The clientId cannot be empty.');
  }
  if (clientSecret === '') {
    throw new Error('The clientSecret cannot be empty.');
  }
  if (appId === '') {
    throw new Error('The appId cannot be empty.');
  }
  if (packageFile === '') {
    throw new Error('The packageFile cannot be empty.');
  }

  // 1. Authenticate
  const authResult = await partnerCenter.authenticate(
    tenantId,
    clientId,
    clientSecret
  );

  core.info("Authenticated...");

  const auth = 'Bearer ' + authResult.access_token;

  // Get the application's info
  const appInfo = await partnerCenter.getAppResourceInfo(auth, appId);

  core.info("Retrieved information for: " + appInfo.primaryName + " application...");

  // Check for pending submissions
  const pendingSubmission =
    appInfo.pendingApplicationSubmission === null ? true : false;

    core.info("Submissiong pending? " + pendingSubmission);

  // If desired, delete the pending submissions
  if (deletePendingSubmissions && pendingSubmission) {
    const successfulDelete = await partnerCenter.deleteSubmission(
      auth,
      appInfo.id,
      appInfo.pendingApplicationSubmission.id
    );

    core.info("Pending submission deleted? " + successfulDelete);
  }

  // Create a new submission
  const createSubResult = await partnerCenter.createAppSubmission(auth, appId);

  core.info("Request new submission: " + createSubResult.status);

  // with an SAS upload URL, we can now upload the appxupload/msixupload file.
  try{
    core.info("Uploading package file...");
    await new BlockBlobClient(createSubResult.fileUploadUrl).uploadFile(packageFile);
    core.info("Upload complete!");
  }catch (err){
    core.error("SAS Upload Error: " + err);
    throw console.error("SAS Upload Error: " + err)
  }

  core.info("Committing submission...: ");

  // Commit
  const commitResult = await partnerCenter.commitSubmission(
    auth,
    appId,
    createSubResult.id
  );

  core.info("Submissiong committed: " + commitResult.status);

  if(failIfUnsuccessful){
    if(commitResult.status == "CommitFailed"
       || commitResult.status == "PublishFailed"
       || commitResult.status == "PreProcessingFailed"
       || commitResult.status == "CertificationFailed"
       || commitResult.status == "ReleaseFailed"){
      core.error(commitResult.status);
      core.setFailed("There was a problem with the app submission, see output errors for more details.")
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
