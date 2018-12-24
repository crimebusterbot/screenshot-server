const B2 = require('backblaze-b2');
const path = require('path');
const fs = require('fs');

function Backblaze() {
    this.upload = async (imageLocation) => {
        return new Promise(async (resolve, reject) => {
            const backblaze = new B2({
                accountId: process.env.BB_ACCOUNT_ID,
                applicationKey: process.env.BB_APPLICATION_KEY
            });

            try {
                let authorization = await backblaze.authorize();

                let uploadUrl = await backblaze.getUploadUrl(process.env.BB_UPLOAD_URL);

                fs.readFile(imageLocation, async (error, data) => {
                    try {
                        let fileInfo = await backblaze.uploadFile({
                            uploadUrl: uploadUrl.data.uploadUrl,
                            uploadAuthToken: uploadUrl.data.authorizationToken,
                            filename: path.basename(imageLocation),
                            data: data
                        });

                        resolve(`${authorization.data.downloadUrl}/file/${authorization.data.allowed.bucketName}/${path.basename(imageLocation)}`);
                    } catch(error) {
                        reject(error);
                    }
                });

            } catch(error) {
                reject(error);
            }
        });
    }
}

module.exports = new Backblaze();