// import {
//   FlightResourceResult,
//   GetSubmissionResult,
//   SubmissionStatusResult,
//   ServiceAuthenticationResult,
//   CommitSubmissionResult,
//   CreateAppSubmissionResult,
//   AppResourceResult
// } from './storeApiModels'
// import got from 'got'
// import qs from 'querystring'
// import { Convert } from './converters'

// // Partner Center API https://docs.microsoft.com/en-us/windows/uwp/monetize/create-and-manage-submissions-using-windows-store-services
// // API endpoints https://docs.microsoft.com/en-us/windows/uwp/monetize/manage-app-submissions

// // https://docs.microsoft.com/en-us/windows/uwp/monetize/create-and-manage-submissions-using-windows-store-services
// export async function authenticate(
//   tenantId: string,
//   clientId: string,
//   clientSecret: string
// ): Promise<ServiceAuthenticationResult> {
//   const rootUrl = `"https://login.microsoftonline.com/${tenantId}/oauth2/token HTTP/1.1`

//   try {
//     let response = await got(rootUrl, {
//       method: 'post',
//       headers: {
//         'content-type': 'application/x-www-form-urlencoded'
//       },
//       body: qs.stringify({
//         grant_type: 'client_credentials',
//         resource: 'https://manage.devcenter.microsoft.com',
//         client_id: clientId,
//         client_secret: clientSecret
//       })
//     })

//     if (response.statusCode == 200) {
//       return Convert.toServiceAuthenticationResult(response.body)
//     } else if (response.statusCode === 400) {
//       throw console.error('400 - The request parameters are invalid.')
//     } else if (response.statusCode === 404) {
//       throw console.error('404 - The specified submission could not be found.')
//     } else if (response.statusCode === 409) {
//       throw console.error(
//         'Error 409 - The specified submission was found but it could not be committed in its current state, or the app uses a Partner Center feature that is currently not supported by the Microsoft Store submission API.'
//       )
//     } else {
//       throw console.error(response.statusMessage)
//     }
//   } catch (err) {
//     throw console.error(err)
//   }
// }

// // https://docs.microsoft.com/en-us/windows/uwp/monetize/create-an-app-submission
// export async function createAppSubmission(
//   bearerToken: string,
//   appId: string
// ): Promise<CreateAppSubmissionResult> {
//   try {
//     const requestUrl = `"https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions"`

//     let response = await got(requestUrl, {
//       method: 'post',
//       headers: {
//         Authorization: bearerToken
//       }
//     })

//     if (response.statusCode == 200) {
//       return Convert.toCreateAppSubmissionResult(response.body)
//     } else if (response.statusCode === 400) {
//       throw console.error('400 - The request parameters are invalid.')
//     } else if (response.statusCode === 404) {
//       throw console.error('404 - The specified submission could not be found.')
//     } else if (response.statusCode === 409) {
//       throw console.error(
//         'Error 409 - The specified submission was found but it could not be committed in its current state, or the app uses a Partner Center feature that is currently not supported by the Microsoft Store submission API.'
//       )
//     } else {
//       throw console.error(response.statusMessage)
//     }
//   } catch (err) {
//     throw console.error(err)
//   }
// }

// export async function getAppResourceInfo(
//   bearerToken: string,
//   appId: string
// ): Promise<AppResourceResult> {
//   try {
//     const requestUrl = `"https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}"`

//     let response = await got(requestUrl, {
//       method: 'get',
//       headers: {
//         Authorization: bearerToken
//       }
//     })

//     if (response.statusCode == 200) {
//       return Convert.toAppInfoResult(response.body)
//     } else if (response.statusCode === 400) {
//       throw console.error('400 - The request parameters are invalid.')
//     } else if (response.statusCode === 404) {
//       throw console.error('404 - The specified submission could not be found.')
//     } else if (response.statusCode === 409) {
//       throw console.error(
//         'Error 409 - The specified submission was found but it could not be committed in its current state, or the app uses a Partner Center feature that is currently not supported by the Microsoft Store submission API.'
//       )
//     } else {
//       throw console.error(response.statusMessage)
//     }
//   } catch (err) {
//     throw err
//   }
// }

// // https://docs.microsoft.com/en-us/windows/uwp/monetize/commit-an-app-submission
// export async function commitSubmission(
//   bearerToken: string,
//   appId: string,
//   submissionId: string
// ): Promise<CommitSubmissionResult> {
//   try {
//     const requestUrl = `"https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions/${submissionId}/commit"`

//     let response = await got(requestUrl, {
//       method: 'post',
//       headers: {
//         Authorization: bearerToken
//       }
//     })

//     if (response.statusCode == 200) {
//       return Convert.toCommitSubmissionResult(response.body)
//     } else if (response.statusCode === 400) {
//       throw console.error('400 - The request parameters are invalid.')
//     } else if (response.statusCode === 404) {
//       throw console.error('404 - The specified submission could not be found.')
//     } else if (response.statusCode === 409) {
//       throw console.error(
//         'Error 409 - The specified submission was found but it could not be committed in its current state, or the app uses a Partner Center feature that is currently not supported by the Microsoft Store submission API.'
//       )
//     } else {
//       throw console.error(response.statusMessage)
//     }
//   } catch (err) {
//     throw err
//   }
// }

// // https://docs.microsoft.com/en-us/windows/uwp/monetize/get-an-app-submission
// export async function getSubmission(
//   bearerToken: string,
//   appId: string,
//   submissionId: string
// ): Promise<GetSubmissionResult> {
//   try {
//     const requestUrl = `"https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions/${submissionId}"`

//     const response = await got(requestUrl, {
//       method: 'post',
//       headers: {
//         Authorization: bearerToken
//       }
//     })

//     if (response.statusCode == 200) {
//       return Convert.toGetSubmissionResult(response.body)
//     } else if (response.statusCode === 400) {
//       throw console.error('400 - The request parameters are invalid.')
//     } else if (response.statusCode === 404) {
//       throw console.error('404 - The specified submission could not be found.')
//     } else if (response.statusCode === 409) {
//       throw console.error(
//         'Error 409 - The specified submission was found but it could not be committed in its current state, or the app uses a Partner Center feature that is currently not supported by the Microsoft Store submission API.'
//       )
//     } else {
//       throw console.error(response.statusMessage)
//     }
//   } catch (err) {
//     throw console.error(err)
//   }
// }

// //https://docs.microsoft.com/en-us/windows/uwp/monetize/get-status-for-an-app-submission
// export async function getSubmissionStatus(
//   bearerToken: string,
//   appId: string,
//   submissionId: string
// ): Promise<SubmissionStatusResult> {
//   try {
//     const requestUrl = `"https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions/${submissionId}/status"`

//     let response = await got(requestUrl, {
//       method: 'get',
//       headers: {
//         Authorization: bearerToken
//       }
//     })

//     if (response.statusCode == 200) {
//       return Convert.toSubmissionStatusResult(response.body)
//     } else if (response.statusCode === 400) {
//       throw console.error('400 - The request parameters are invalid.')
//     } else if (response.statusCode === 404) {
//       throw console.error('404 - The specified submission could not be found.')
//     } else if (response.statusCode === 409) {
//       throw console.error(
//         'Error 409 - The specified submission was found but it could not be committed in its current state, or the app uses a Partner Center feature that is currently not supported by the Microsoft Store submission API.'
//       )
//     } else {
//       throw console.error(response.statusMessage)
//     }
//   } catch (err) {
//     throw console.error(err)
//   }
// }

// // ref- https://docs.microsoft.com/en-us/windows/uwp/monetize/delete-an-app-submission
// export async function deleteSubmission(
//   bearerToken: string,
//   appId: string,
//   submissionId: string
// ): Promise<boolean> {
//   try {
//     const requestUrl = `"https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions/${submissionId}"`

//     let response = await got(requestUrl, {
//       method: 'delete',
//       headers: {
//         Authorization: bearerToken
//       }
//     })

//     if (response.statusCode == 200) {
//       return true
//     } else if (response.statusCode === 400) {
//       throw console.error('400 - The request parameters are invalid.')
//     } else if (response.statusCode === 404) {
//       throw console.error('404 - The specified submission could not be found.')
//     } else if (response.statusCode === 409) {
//       throw console.error(
//         'Error 409 - The specified submission was found but it could not be committed in its current state, or the app uses a Partner Center feature that is currently not supported by the Microsoft Store submission API.'
//       )
//     } else {
//       return false
//     }
//   } catch (err) {
//     throw console.error(err)
//   }
// }
