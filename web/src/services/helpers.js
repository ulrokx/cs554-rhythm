
function round(num, places){
    const power = Math.pow(10, places);
    return Math.round(num*power) / power;
}

export{
    round
}