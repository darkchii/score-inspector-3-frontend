class RawBeatmapInfo {
    constructor(data) {
        this.DifficultyName = data.difficultyName;
        this.File = data.file;
        this.Status = data.status;
        this.StatusInt = data.statusInt;
        this.OnlineID = data.onlineID;
        this.Length = data.length;
        this.BPM = data.bpm;
        this.Hash = data.hash;
        this.StarRating = data.starRating;
        this.MD5Hash = data.md5Hash;
        this.OnlineMD5Hash = data.onlineMD5Hash;
        this.LastLocalUpdate = data.lastLocalUpdate;
        this.LastOnlineUpdate = data.lastOnlineUpdate;
        this.MatchesOnlineVersion = data.matchesOnlineVersion;
        this.EndTimeObjectCount = data.endTimeObjectCount;
        this.TotalObjectCount = data.totalObjectCount;
        this.LastPlayed = data.lastPlayed;
        this.BeatDivisor = data.beatDivisor;
        this.EditorTimestamp = data.editorTimestamp;
        this.Path = data.path;
        this.OnlineInfo = data.onlineInfo;
        this.MaxCombo = data.maxCombo;
    }
}

export default RawBeatmapInfo;