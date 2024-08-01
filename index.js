const df = new DataFetcher();

setTimeout(()=>{
    df.findSong('5 milionów influencerek').then(console.log);
},500);