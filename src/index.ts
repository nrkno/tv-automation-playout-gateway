import { Connector, Config } from './connector'
import * as Winston from 'winston'

// CLI arguments / Environment variables --------------
let host: string 		= process.env.CORE_HOST 					|| '127.0.0.1'
let port: number 		= parseInt(process.env.CORE_PORT + '', 10) 	|| 3000
let logPath: string 	= process.env.CORE_LOG						|| ''

logPath = logPath

let prevProcessArg = ''
process.argv.forEach((val) => {
	if (prevProcessArg.match(/-host/i)) {
		host = val
	} else if (prevProcessArg.match(/-port/i)) {
		port = parseInt(val, 10)
	} else if (prevProcessArg.match(/-log/i)) {
		logPath = val
	}
	prevProcessArg = val + ''
})

// Setup logging --------------------------------------
let logger = new (Winston.Logger)({
})

if (logPath) {
	// Log json to file, human-readable to console
	console.log('Logging to', logPath)
	logger.add(Winston.transports.Console, {
		level: 'verbose',
		handleExceptions: true,
		json: false
	})
	logger.add(Winston.transports.File, {
		level: 'debug',
		handleExceptions: true,
		json: true,
		filename: logPath
	})
	// Hijack console.log:
	// @ts-ignore
	let orgConsoleLog = console.log
	console.log = function (...args: any[]) {
		// orgConsoleLog('a')
		if (args.length >= 1) {
			// @ts-ignore one or more arguments
			logger.debug(...args)
			orgConsoleLog(...args)
		}
	}
} else {
	console.log('Logging to Console')
	// Log json to console
	logger.add(Winston.transports.Console,{
		handleExceptions: true,
		json: true
	})
	// Hijack console.log:
	// @ts-ignore
	let orgConsoleLog = console.log
	console.log = function (...args: any[]) {
		// orgConsoleLog('a')
		if (args.length >= 1) {
			// @ts-ignore one or more arguments
			logger.debug(...args)
		}
	}
}




logger.info('------------------------------------------------------------------')
logger.info('Starting Playout Gateway')
let c = new Connector(logger)
let config: Config = {
	core: {
		host: host,
		port: port
	},
	tsr: {
		devices: {} // to be fetched from Core
	},
	mediaScanner: {
		collectionId: 'default' // TODO: to be fetched from core
	}
}

logger.info('Core:          ' + config.core.host + ':' + config.core.port)
logger.info('------------------------------------------------------------------')
c.init(config)
.catch(e => {
	logger.error(e)
})