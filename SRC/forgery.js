import { program } from 'commander'
import mysql2 from 'mysql2/promise'
import ForgeryKit from './forgerykit.js'
import { Presets, SingleBar } from 'cli-progress'

async function connect(options) {
	const connection = await mysql2.createConnection({
		host     : options.host,
		user     : options.user,
		password : options.pass,
		database : options.db
	})
	console.log("Connected.")
	return connection
}

async function times(n, run) {
	const bar = new SingleBar({
		barIncompleteChar: " ",
		barCompleteChar: "=",
		format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'})
	bar.start(n,0)
	for (let i = 0; i < n; i++) {
		await run(i)
		bar.update(i+1)
	}
	bar.stop()
}

program
	.requiredOption('--host <host>', 'database host (required)')
	.requiredOption('--user <user>', 'database username (required)')
	.requiredOption('--pass <pass>', 'database password (required)')
	.requiredOption('--db <db>', 'database name (required)')
	
const create = program.command('create')
create.command('cosmetics <amount>').action(async (amount) => {
	
	const kit = new ForgeryKit(await connect(program.opts()))
	
	console.log("Creating front cosmetics")
	await times(amount, async()=>{
		await kit.insertFrontCosmetic(10, 2000)
	})

	kit.end()
})

program.parse()
