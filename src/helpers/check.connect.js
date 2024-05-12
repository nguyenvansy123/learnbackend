'use strict'

const mongoose = require("mongoose")
const os = require("os")
const process = require("process")
const _SECONDS = 5000

//count connect
const countConnect = () => {
    const numConnection = mongoose.connect.length
    console.log(`Number of connetion::${numConnection}`)
}

//check over load

const checkOverLoad = () => {
    setInterval(() => {
        const numConnection = mongoose.connect.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        //example maxium number of connection based on number osf cores
        const maxConnections = numCores * 5

        if(numConnection > maxConnections){
            console.log("connections overload")
        }

    }, _SECONDS);//monitior every 5 seconds
}

module.exports = {
    countConnect
}

