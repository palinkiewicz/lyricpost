const fetcher = new DataFetcher();

setTimeout(()=>{
    fetcher.findSong('chivas trash').then(console.log);
},500);