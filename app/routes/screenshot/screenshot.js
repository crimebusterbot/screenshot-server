const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const domain = require('../../lib/domain');

function Screenshot() {
    this.make = (url, res) => {
        if(url) {
            (async () => {
                try {
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();

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

                    const folder = path.resolve(relativeFolder);
                    console.log(folder);
                    res.status(200);
                    res.send({ success: true, imageName: `${imageName}.png`, imageLocation: `${folder}/${imageName}.png`});

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