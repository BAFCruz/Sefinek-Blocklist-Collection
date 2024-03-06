const { promises: fs } = require('node:fs');
const path = require('node:path');
const date = require('../functions/date.js');
const sha256 = require('../functions/sha512.js');

const format = 'noip';

const convert = async (folderPath = path.join(__dirname, '../../blocklist/template'), relativePath = '') => {
	const generatedPath = path.join(__dirname, `../../blocklist/generated/${format}`, relativePath);
	try {
		await fs.access(generatedPath);
	} catch (err) {
		await fs.mkdir(generatedPath, { recursive: true });
	}

	const files = await fs.readdir(folderPath, { withFileTypes: true });
	const txtFiles = files.filter(file => file.isFile() && file.name.endsWith('.txt'));

	await Promise.all(txtFiles.map(async file => {
		const thisFileName = path.join(folderPath, file.name);

		// Cache
		const { cacheHash, stop } = await sha256(thisFileName, format, file);
		if (stop) return;

		// Content
		const fileContent = await fs.readFile(thisFileName, 'utf8');
		const replacedFile = fileContent
			.replaceAll(
				/127\.0\.0\.1 localhost\.localdomain|255\.255\.255\.255 broadcasthost|ff0(?:0::0 ip6-mcastprefix|2::(?:2 ip6-allrouter|(?:1 ip6-allnode|3 ip6-allhost))s)|(?:fe80::1%lo0 |(?:(?:127\.0\.0\.|::)1 {2}|::1 (?:ip6-)?))localhost|ff00::0 ip6-localnet|127\.0\.0\.1 local(?:host)?|::1 ip6-loopback|0\.0\.0\.0 0\.0\.0\.0/gi,
				'',
			)
			.replaceAll('#=====', '# =====')
			// grex "0.0.0.0 " "127.0.0.1 "
			.replaceAll(/^(?:127\.0\.0\.1|0\.0\.0\.0) /gmu, '')
			// grex "#" "::"
			.replaceAll(/::|#/gmu, '#')
			.replace(/<Release>/gim, 'No IP (only domains)')
			.replace(/<Version>/gim, date.timestamp.toString())
			.replace(/<LastUpdate>/gim, `${date.full} | ${date.now} | ${date.timezone}`);

		const fullNewFile = path.join(generatedPath, file.name);
		await fs.writeFile(fullNewFile, replacedFile);

		console.log(`✔️ ${cacheHash || file.name} ++ ${fullNewFile}`);
	}));

	try {
		const subdirectories = files.filter(file => file.isDirectory());
		await Promise.all(subdirectories.map(async subdirectory => {
			const nextRelativePath = path.join(relativePath, subdirectory.name);
			await convert(path.join(folderPath, subdirectory.name), nextRelativePath);
		}));
	} catch (err) {
		console.error(`❌ Error processing ${folderPath}:`, err);
	}
};

const run = async () => {
	await convert();
	console.log('\n');
};

(async () => await run())();

module.exports = run;