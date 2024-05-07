class Level{
    constructor(levelObj={keyMap: {'[Key]': [0]}, difficulty: 'easy', margin: 0.5, songName: "", songLength: 0}){
        this.keyMap = levelObj.keyMap;
        this.diff = levelObj.difficulty;
        this.margin = levelObj.margin;
        this.songName = levelObj.songName;
        this.songLength = levelObj.songLength;

        this.currentScore = 0;
        this.currentStreak = 0;
        this.comboMultiplier = 1;
    }

    /**
     * @param {Number} time 
     */
    isValidPress(key, time){
        const timeArr = this.keyMap[key];
        let i;
        for (i = 0; i < timeArr.length && timeArr[i] <= time; i++) {
            if(((timeArr[i] + this.margin) >= time) && ((timeArr[i] - this.margin) <= time)){
                this.keyMap[key].splice(i);
                return true;
            }
        }
        this.keyMap[key].splice(i);
        return false;
    }

    testKey(key, time){
        if(this.isValidPress(key, time)){
            // Add to score
            this.currentStreak++;
            if(this.currentStreak % 8 === 0) this.comboMultiplier <<= 1;
            this.currentScore += (100* this.comboMultiplier);
        }
        else{
            //Do something else
            this.currentStreak = 0;
            this.comboMultiplier = 1;
        }
    }

    getScore(){
        return this.currentScore;
    }
}