Papa.parse("https://databank.worldbank.org/data/download/WDI_csv.zip", {
	download: true,
	complete: function(results) {
		console.log(results);
	}
});