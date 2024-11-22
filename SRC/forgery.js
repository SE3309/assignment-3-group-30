import { program } from 'commander'
import mysql2 from 'mysql2/promise'
import ForgeryKit from './forgerykit.js'
import { MultiBar, Presets, SingleBar } from 'cli-progress'

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

async function times(times, run, display) {
	const multiBar = display? display : new MultiBar({
		barIncompleteChar: " ",
		barCompleteChar: "=",
		format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'})
	const n = Math.floor(times)
	const bar = multiBar.create(n,0)
	for (let i = 0; i < n; i++) {
		await run(i, multiBar)
		bar.update(i+1)
	}
	bar.update(n)
	bar.stop()
	if (!display){
		multiBar.stop()
	} else {
		display.remove(bar)
	}
}

async function parallel(times, run, display) {
	const multiBar = display? display : new MultiBar({
		barIncompleteChar: " ",
		barCompleteChar: "=",
		format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'})
	const n = Math.floor(times)
	const bar = multiBar.create(n,0)
	const promises = []
	for (let i = 0; i < n; i++) {
		promises.push((async() =>{
			await run(i, multiBar)
			bar.increment()
		})())
	}
	await Promise.all(promises)
	bar.update(n)
	bar.stop()
	if (!display){
		multiBar.stop()
	} else {
		display.remove(bar)
	}
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
create.command('polls <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	console.log("Creating polls.")
	await times(amount, async()=>{
		await kit.insertPoll()
	})

	kit.end()
})
create.command('suggested-polls <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	let validUsers = await kit.getValidUserIDs()

	if (validUsers.length < amount) {
		kit.end()
		console.log("Not enough users. Create more first.")
		return
	}

	console.log("Creating suggested polls.")
	await times(amount, async()=>{
		await kit.insertPollWithSuggester(validUsers[Math.floor(Math.random() * validUsers.length)])
	})

	kit.end()
})

create.command('submissions <polls> <amount>').action(async (polls, amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	let validPolls = await kit.getValidPollIDs()
	let validUsers = await kit.getValidUserIDs()

	if (validUsers.length < amount) {
		kit.end()
		console.log("Not enough users. Create more first.")
		return
	}

	console.log("Creating submissions.")
	await times(polls, async(i, display)=>{
		const poll = validPolls[Math.floor(validPolls.length * Math.random())]
		const voteSplit = Math.random()
		const predictionSplit = Math.random()
		await times(amount, async()=>{
			try {
				await kit.insertSubmission(voteSplit, predictionSplit, poll, validUsers)
			}catch(e){}
		}, display)
	})

	kit.end()
})

create.command('comments <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	let validUsers = await kit.getValidUserIDs()
	let validPolls = await kit.getValidPollIDs()

	if (validUsers.length < amount) {
		kit.end()
		console.log("Not enough users. Create more first.")
		return
	}

	console.log("Creating comments.")
	await times(amount, async()=>{
		await kit.insertComment(validUsers, validPolls, false)
	})

	kit.end()
})

create.command('replies <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	let validUsers = await kit.getValidUserIDs()
	let validComments = await kit.getValidCommentIDs()

	if (validUsers.length === 0 || validComments.length === 0) {
		kit.end()
		console.log("Not enough users or comments. Create more first.")
		return
	}

	console.log("Creating replies.")
	await times(amount, async()=>{
		await kit.insertReply(validUsers, validComments, false)
	})

	kit.end()
})

create.command('suggestions <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	let validUsers = await kit.getValidUserIDs()

	if (validUsers.length === 0) {
		kit.end()
		console.log("Not enough users. Create more first.")
		return
	}

	console.log("Creating suggestions.")
	await times(amount, async()=>{
		await kit.insertSuggestion(validUsers, false)
	})

	kit.end()
})

create.command('admins <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	console.log("Creating admins.")
	await times(amount, async()=>{
		await kit.insertAdmin()
	})

	kit.end()
})

create.command('reports <amount>').action(async (amount)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	let validUsers = await kit.getValidUserIDs()
	let validComments = await kit.getValidCommentIDs()
	let validReplies = await kit.getValidReplyIDs()

	if (validUsers.length === 0 || validComments.length === 0 || validReplies.length === 0) {
		kit.end()
		console.log("Not enough users or comments or replies. Create more first.")
		return
	}

	console.log("Creating reports.")
	await times(amount, async()=>{
		if (Math.random() < 0.333) {
			await kit.insertUserReport(validUsers, false)
		} else if (Math.random() < 0.666) {
			await kit.insertCommentReport(validComments, validUsers, false)
		} else {
			await kit.insertReplyReport(validReplies, validUsers, false)
		}
	})

	kit.end()
})

program.command("simulate").argument('[multiplier]', 'Multiplier on rows to create. Eg. 1 for default amount, 0.5 for half, 2 for double. Gets pretty slow pretty fast if you make it more than like 1.', 1)
.action(async (multiplier)=>{
	const kit = new ForgeryKit(await connect(program.opts()))

	console.log("Creating admins...")
	await times(multiplier * 5, async()=>{
		await kit.insertAdmin()
	})


	console.log("Creating cosmetics [Front]...")
	await times(multiplier * 100, async()=>{
		await kit.insertFrontCosmetic(10, 2000)
	})
	console.log("Creating cosmetics [Middle]...")
	await times(multiplier * 100, async()=>{
		await kit.insertMiddleCosmetic(10, 2000)
	})
	console.log("Creating cosmetics [Back]...")
	await times(multiplier * 100, async()=>{
		await kit.insertBackCosmetic(10, 2000)
	})
	const validCosmetics = await kit.getValidCosmetics()

	console.log("Creating users...")
	await times(multiplier * 3000, async()=>{
		try {
			await kit.insertUser(validCosmetics)
		}catch(e) {}
	})
	const validUsers = await kit.getValidUserIDs()

	console.log("Creating purchases...")
	await times(multiplier * 3000, async()=>{
		const user = validUsers[Math.floor(Math.random() * validUsers.length)]

		if (Math.random() < 0.333) {
			const cosmetic = validCosmetics.front[Math.floor(validCosmetics.front.length * Math.random())]
			try {
				await kit.insertFrontCosmeticPurchase(user, cosmetic)
			}catch(e) {}
		} else if (Math.random() < 0.666) {
			const cosmetic = validCosmetics.middle[Math.floor(validCosmetics.middle.length * Math.random())]
			try {
				await kit.insertMiddleCosmeticPurchase(user, cosmetic)
			}catch(e) {}
		} else {
			const cosmetic = validCosmetics.back[Math.floor(validCosmetics.back.length * Math.random())]
			try {
				await kit.insertBackCosmeticPurchase(user, cosmetic)
			}catch(e) {}
		}
	})

	console.log("Creating polls...")
	await times(multiplier * 800, async()=>{
		await kit.insertPoll()
	})
	const validPolls = await kit.getValidPollIDs()

	console.log("Creating comments...")
	await times(multiplier * 6000, async()=>{
		await kit.insertComment(validUsers, validPolls, false)
	})
	const validOpenComments = await kit.getValidCommentIDs()
	console.log("Creating replies...")
	await times(multiplier * 6000 * 2, async()=>{
		await kit.insertReply(validUsers, validOpenComments, false)
	})
	console.log("Creating closed comments...")
	await times(multiplier * 6000, async()=>{
		await kit.insertComment(validUsers, validPolls, true)
	})
	const validComments = await kit.getValidCommentIDs()
	console.log("Creating closed replies...")
	await times(multiplier * 6000 * 2, async()=>{
		await kit.insertReply(validUsers, validComments, true)
	})
	const validReplies = await kit.getValidReplyIDs()

	console.log("Creating suggestions...")
	await times(multiplier * 500, async()=>{
		await kit.insertSuggestion(validUsers, false)
	})
	console.log("Creating dismissed suggestions...")
	await times(multiplier * 300, async()=>{
		await kit.insertSuggestion(validUsers, true)
	})

	console.log("Creating reports...")
	await times(multiplier * 539, async()=>{
		try {
			if (Math.random() < 0.333) {
				await kit.insertUserReport(validUsers, false)
			} else if (Math.random() < 0.666) {
				await kit.insertCommentReport(validComments, validUsers, false)
			} else {
				await kit.insertReplyReport(validReplies, validUsers, false)
			}
		}catch(e) {}
	})


	console.log("Opening additional connections...")
	const kits = [
		kit, 
		new ForgeryKit(await connect(program.opts())),
		new ForgeryKit(await connect(program.opts())),
		new ForgeryKit(await connect(program.opts())),
		new ForgeryKit(await connect(program.opts())),
		new ForgeryKit(await connect(program.opts())),
		new ForgeryKit(await connect(program.opts())),
		new ForgeryKit(await connect(program.opts())),
	]
	console.log("Creating submissions...")
	await times(validPolls.length, async(i, display)=>{
		const poll = validPolls[i]
		const voteSplit = Math.random()
		const predictionSplit = Math.random()
		await parallel(8, async(i)=>{
			await times(multiplier * 375, async()=>{
				try {
					await kits[i].insertSubmission(voteSplit, predictionSplit, poll, validUsers)
				}catch(e){}
			}, display)
		}, display)
	})

	

	for (const kitsKit of kits) {
		kitsKit.end()
	}
	console.log("Done!")
})

program.parse()
