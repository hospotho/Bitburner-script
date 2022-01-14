export function hackPercent(player, server) {
    const balanceFactor = 240;
    const difficultyMult = (100 - server.hackDifficulty) / 100;
    const skillMult = (player.hacking - (server.requiredHackingSkill - 1)) / player.hacking;
    const percentMoneyHacked = (difficultyMult * skillMult * player.hacking_money_mult) / balanceFactor;
    if (percentMoneyHacked < 0) {
        return 0;
    }
    if (percentMoneyHacked > 1) {
        return 1;
    }
    return percentMoneyHacked * 1 //BitNodeMultipliers.ScriptHackMoney;
}

export function growPercent(player, server, threads, cores = 1) {
    const numServerGrowthCycles = Math.max(Math.floor(threads), 0);
    const growthRate = 1.03 //CONSTANTS.ServerBaseGrowthRate;
    let adjGrowthRate = 1 + (growthRate - 1) / server.hackDifficulty;
    if (adjGrowthRate > 1.0035 /*CONSTANTS.ServerMaxGrowthRate*/ ) {
        adjGrowthRate = 1.0035 /*CONSTANTS.ServerMaxGrowthRate*/ ;
    }
    const serverGrowthPercentage = server.serverGrowth / 100;
    const numServerGrowthCyclesAdjusted =
        numServerGrowthCycles * serverGrowthPercentage * 1 //BitNodeMultipliers.ServerGrowthRate;
    const coreBonus = 1 + (cores - 1) / 16;
    return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * player.hacking_grow_mult * coreBonus);
}

export function weakenTime(player, server) {
    const weakenTimeMultiplier = 4;
    return weakenTimeMultiplier * utilCalculateHackingTime(server, player) * 1000;
}

export function growTime(player, server) {
    const growTimeMultiplier = 3.2;
    return growTimeMultiplier * utilCalculateHackingTime(server, player) * 1000;
}

export function hackTime(player, server) {
    return utilCalculateHackingTime(player, server) * 1000;
}

function utilCalculateIntelligenceBonus(intelligence, weight = 1) {
    return 1 + (weight * Math.pow(intelligence, 0.8)) / 600;
}

function utilCalculateHackingTime(player, server) {
    const difficultyMult = server.requiredHackingSkill * server.hackDifficulty;
    const baseDiff = 500;
    const baseSkill = 50;
    const diffFactor = 2.5;
    let skillFactor = diffFactor * difficultyMult + baseDiff;
    skillFactor /= player.hacking + baseSkill;
    const hackTimeMultiplier = 5;
    const hackingTime =
        (hackTimeMultiplier * skillFactor) /
        (player.hacking_speed_mult * utilCalculateIntelligenceBonus(player.intelligence, 1));
    return hackingTime;
}