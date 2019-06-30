const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const crypto = require('crypto');
puppeteer.use(require('puppeteer-extra-plugin-stealth')());

const domain = require('../../lib/domain');
const backblaze = require('../../lib/backblaze');

function Screenshot() {
    this.make = async (url, res) => {
        try {
            // If there is no URL we can't run.
            if(!url) throw({success: false, message: 'No URL'});
            url = decodeURIComponent(url);

            const imageInfo = await makeScreenshot(url);

            res.status(200);
            res.send(imageInfo);
        } catch (error) {
            res.status(500);
            res.send(error);
        }
    }
}

async function makeScreenshot(url) {
    return new Promise(async (resolve, reject) => {
        let browser;
        try {
            // Make sure the docker with chrome is running https://docs.browserless.io/docs/docker-quickstart.html
            browser = await puppeteer.connect({browserWSEndpoint: process.env.SH_SERVER_ENDPOINT, ignoreHTTPSErrors: true});
            const page = await browser.newPage();

            await page.setViewport({width: 800, height: 600});
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36');

            const status = await page.goto(url, {
                timeout: 15000,
                waitUntil: 'networkidle2',
                referer: 'https://www.google.com/'
            });

            page.on('unhandledRejection', () => {
                throw({success: false, message: 'The screenshot server had an unhandled rejection!'});
            });

            const relativeFolder = './images';
            const imageName = domain.base(url) + '-' + crypto.randomBytes(2).toString('hex');
            
            // Actually make the screenshot
            await page.screenshot({path: `${relativeFolder}/${imageName}.png`, fullPage: true});
            await page.close();
            await browser.close();

            // Upload the image to backblaze for later use.
            let uploadInfo = await backblaze.upload(`${relativeFolder}/${imageName}.png`);

            // Remove the image from temp storage
            fs.unlink(`${relativeFolder}/${imageName}.png`, (err) => {
                if(err) {
                    throw({ success: false, message: 'Something went wrong trying delete the file on server', error: err});
                }

                resolve({ success: true, imageName: `${imageName}.png`, imageLocation: uploadInfo, headerInformation: status._headers, statusCode: status._status});
            });
        } catch (error) {
            await browser.close();
            reject({ success: false, message: 'Something went wrong trying to get a screenshot', error: error});
        }
    });
}

module.exports = new Screenshot();