const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
puppeteer.use(require('puppeteer-extra-plugin-stealth')());

const domain = require('../../lib/domain');
const backblaze = require('../../lib/backblaze');

function Screenshot() {
    this.make = (url, res) => {
        if(url) {
            (async () => {
                try {
                    // Make sure the docker with chrome is running https://docs.browserless.io/docs/docker-quickstart.html
                    // TODO put the url in a ENV
                    const browser = await puppeteer.connect({browserWSEndpoint: process.env.SH_SERVER_ENDPOINT, ignoreHTTPSErrors: true});
                    const page = await browser.newPage();

                    await page.setViewport({width: 800, height: 600});
                    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

                    page.on('unhandledRejection', (msg) => {
                        console.log('Unhandled Rejection!');
                        console.log(msg);
                    });

                    url = decodeURIComponent(url);

                    const imageName = domain.base(url) + '-' + crypto.randomBytes(2).toString('hex');

                    try {
                        const status = await page.goto(url, {
                            timeout: 15000,
                            waitUntil: 'networkidle2'
                        });

                        const relativeFolder = './images';
                        await page.screenshot({path: `${relativeFolder}/${imageName}.png`, fullPage: true});
                        await page.close();
                        await browser.close();

                        let uploadInfo = await backblaze.upload(`${relativeFolder}/${imageName}.png`);

                        fs.unlink(`${relativeFolder}/${imageName}.png`, (err) => {
                            if(err) {
                                res.status(500);
                                res.send({ success: false, message: 'Something went wrong trying delete the file on server', error: err});
                            }

                            res.status(200);
                            res.send({ success: true, imageName: `${imageName}.png`, imageLocation: uploadInfo, headerInformation: status._headers, statusCode: status._status});
                        });
                    } catch (error) {
                        await browser.close();

                        console.log('Error ' + new Date());
                        console.log(error);

                        res.status(500);
                        res.send({ success: false, message: 'Something went wrong trying to get a screenshot', error: error});
                    }
                } catch(error) {
                    res.status(500);
                    res.send({ success: false, message: 'Something went wrong trying to get a screenshot', error: error});
                }
            })();
        } else {
            res.status(500);
            res.send({ success: false, message: 'There is no URL defined'});
        }
    }
}

module.exports = new Screenshot();