const df = new DataFetcher();

setTimeout(()=>{
    df.findSong('chivas trash').then(console.log);
},500);