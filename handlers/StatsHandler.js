class StatsHandler
{
    constructor(parent)
    {
        this.parent = parent;
    }

    getProfanityStats(uid)
    {
        var stats = Database.getData(`/${uid}/profanity_warnings`);
        return (stats.length - 1);
    }

    getModPoints(uid)
    {
        var stats = Database.getData(`/${uid}/user_warnings`);
        return (stats.length - 1);
    }

    getKickPoints(uid)
    {
        var stats = Database.getData(`/${uid}/user_kicks`);
        return (stats.length - 1);
    }

    getBanPoints(uid)
    {
        var stats = Database.getData(`/${uid}/user_bans`);
        return (stats.length - 1);
    }
}

module.exports = StatsHandler;
