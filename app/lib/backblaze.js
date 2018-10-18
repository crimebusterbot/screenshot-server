const B2 = require('backblaze-b2');
const path = require('path');
const fs = require('fs');

function Backblaze() {
    this.upload = async (imageLocation) => {
        return new Promise(async (resolve, reject) => {
            const backblaze = new B2({
                accountId: '002a8a41c8f6cfc0000000001',
                applicationKey: 'K002sUiQ6Pmk5ySOwBCto2iHR8Ux/84'
            });

            try {
                let authorization = await backblaze.authorize();

                let uploadUrl = await backblaze.getUploadUrl('6a08cad4116c883f666c0f1c');

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