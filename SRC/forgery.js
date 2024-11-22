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

async function times(times, run) {
	const n = Math.floor(times)
	const bar = new SingleBar({
		barIncompleteChar: " ",
		barCompleteChar: "=",
		format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'})
	bar.start(n,0)
	for (let i = 0; i < n; i++) {
		await run(i)
		bar.update(i)
	}
	bar.update(n)
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
	
	console.log("Creating front cosmetics...")
	await times(amount, async()=>{
		await kit.insertFrontCosmetic(10, 2000)
	})
	console.log("Creating middle cosmetics...")
	await times(amount, async()=>{
		await kit.insertMiddleCosmetic(10, 2000)
	})
	console.log("Creating back cosmetics.")
	await times(amount, async()=>{
		await kit.insertBackCosmetic(10, 2000)
	})

	kit.end()
})
create.command('users <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	let validCosmetics = await kit.getValidCosmetics()

	if (validCosmetics.front.length === 0 || validCosmetics.middle.length === 0 || validCosmetics.back.length === 0) {
		kit.end()
		console.log("Not enough cosmetics. Create more first.")
		return
	}

	console.log("Creating users.")
	await times(amount, async()=>{
		await kit.insertUser(validCosmetics)
	})

	kit.end()
})

create.command('purchases <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	let validCosmetics = await kit.getValidCosmetics()

	if (validCosmetics.front.length === 0 || validCosmetics.middle.length === 0 || validCosmetics.back.length === 0) {
		kit.end()
		console.log("Not enough cosmetics. Create more first.")
		return
	}

	let validUsers = await kit.getValidUserIDs()

	if (validUsers.length < amount) {
		kit.end()
		console.log("Not enough users. Create more first.")
		return
	}

	console.log("Creating purchases.")
	await times(amount, async()=>{
		const user = validUsers[Math.floor(Math.random() * validUsers.length)]

		if (Math.random() < 0.333) {
			const cosmetic = validCosmetics.front[Math.floor(validCosmetics.front.length * Math.random())]
			await kit.insertFrontCosmeticPurchase(user, cosmetic)
		} else if (Math.random() < 0.666) {
			const cosmetic = validCosmetics.middle[Math.floor(validCosmetics.middle.length * Math.random())]
			await kit.insertMiddleCosmeticPurchase(user, cosmetic)
		} else {
			const cosmetic = validCosmetics.back[Math.floor(validCosmetics.back.length * Math.random())]
			await kit.insertBackCosmeticPurchase(user, cosmetic)
		}

	})

	kit.end()
})

program.parse()
