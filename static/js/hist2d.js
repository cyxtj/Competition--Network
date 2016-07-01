
function hist2d(D, binsize){
    // D is like [[x, y], [x, y], ...]
    // binsize is a array of [xbinsize, ybinsize]
    // return the 2d histogram 
    console.log(D);
    var D2 = []; // make a copy
    for (i = 0; i< D.length; i++){
        D2[i] = [];
        D2[i][0] = Math.floor(D[i][0] / binsize[0]);
        D2[i][1] = Math.floor(D[i][1] / binsize[1]);
    }
    return group_count(D2);
}
function group_count(D){
    // H is a nxn empty matrix to record count
    console.log("group count input");
    console.log(D);
    var H = [];
    for (i = 0; i < D.length; i++) { 
        if(H[D[i][0]] == undefined){H[D[i][0]] = [];}
        if(H[D[i][0]][D[i][1]] > 0){
            H[D[i][0]][D[i][1]] = H[D[i][0]][D[i][1]] + 1;
        }else{
            H[D[i][0]][D[i][1]] = 1;
        }
    }
    console.log("H:");
    console.log(H);
    // H2 is a list of [i, j, count], where count > 0
    var H2 = [];
    for (i = 0; i < H.length; i++){
        if(H[i]==undefined){continue;}
        for (j = 0; j < H[i].length; j++){
            if (H[i][j] != undefined){
                H2.push([i, j, H[i][j]]);
            }
        }
    }
    console.log("group count output");
    console.log(H2);
    return H2;

}
