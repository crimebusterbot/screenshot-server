const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const domain = require('../../lib/domain');
const backblaze = require('../../lib/backblaze');

function Screenshot() {
    this.make = (url, res) => {
        if(url) {
            (async () => {
                try {
                    const browser = await puppeteer.launch({
                        args: [
                            '--disable-dev-shm-usage',
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-accelerated-2d-canvas',
                            '--disable-gpu',
                        ]
                    });

                    const page = await browser.newPage();
                    await page.setRequestInterception(true);
                    await page.setViewport({width: 800, height: 600});
                    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

                    page.on('request', async(request) => {
                        await skipResources(request);
                    });

                    url = decodeURIComponent(url);

                    const imageName = domain.base(url) + '-' + crypto.randomBytes(2).toString('hex');

                    try {
                        const status = await page.goto(url, {
                            timeout: 15000,
                            waitUntil: 'networkidle2'
                        });

                        page.on('unhandledRejection', async(msg) => {
                            console.log('Unhandled Rejection!');
                            console.log(msg);
                            await browser.close();
                        });

                        if (!status.ok) {
                            await page.close();
                            await browser.close();

                            res.status(404);
                            res.send({ success: false, message: 'This website may be offline or taking to long to respond'});
                        }

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

async function skipResources(request) {
    const skippedResources = [
        'quantserve',
        'adzerk',
        'doubleclick',
        'adition',
        'exelator',
        'sharethrough',
        'cdn.api.twitter',
        'google-analytics',
        'googletagmanager',
        'google',
        'facebook',
        'analytics',
        'optimizely',
        'clicktale',
        'mixpanel',
        'zedo',
        'clicksor',
        'tiqcdn',
    ];

    const requestUrl = request._url.split('?')[0].split('#')[0];

    if (
        skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
    ) {
        request.abort();
    } else {
        request.continue();
    }
}

module.exports = new Screenshot();