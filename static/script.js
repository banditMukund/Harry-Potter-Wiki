jQuery(document).on('click', '.mega-dropdown', function(e) {
		e.stopPropagation()
	});


//Character List -> https://hp-api.onrender.com/api/characters

const getCharacterDetails = async () => {
	
	let endpoint = 'https://hp-api.onrender.com/api/characters';
	let res = await fetch("//api/characters")
		.catch(() => {
			console.log("First function");
		})
}