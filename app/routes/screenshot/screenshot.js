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
                            '--disable-setuid-sandbox'
                        ]
                    });

                    const page = await browser.newPage();
                    const baseUrl = 'https://screenshot.api.webshop-checker.nl';

                    url = decodeURIComponent(url);

                    const imageName = domain.base(url) + '-' + crypto.randomBytes(2).toString('hex');
                    await page.setViewport({width: 800, height: 600});
                    const status = await page.goto(url, {waitUntil: 'networkidle2'});
                    const relativeFolder = './images';

                    if (!status.ok) {
                        res.status(404);
                        res.send({ success: false, message: 'This website may be offline or taking to long to respond'});
                    }

                    await page.screenshot({path: `${relativeFolder}/${imageName}.png`, fullPage: true});
                    page.close();

                    let uploadInfo = await backblaze.upload(`${relativeFolder}/${imageName}.png`);

                    fs.unlink(`${relativeFolder}/${imageName}.png`, (err) => {
                        if(err) {
                            res.status(500);
                            res.send({ success: false, message: 'Something went wrong trying delete the file on server', error: error});
                        }

                        res.status(200);
                        res.send({ success: true, imageName: `${imageName}.png`, imageLocation: uploadInfo});
                    });
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