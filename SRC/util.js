export function randomID() {
	const a = ["A", "B", "C", "D", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	const n = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

	function rng(array) {
		return array[Math.floor(Math.random()*array.length)]
	}

	return `${rng(a)}${rng(a)}${rng(n)}${rng(a)}${rng(n)}${rng(a)}${rng(a)}`
}