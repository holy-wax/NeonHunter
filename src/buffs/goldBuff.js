export function getTimeBonus(buffs) {
    return buffs.filter(b => b.id === 'time_lv3').length * 20;
}
export function getPriceBonus(buffs, color) {
    let bonus = 0;
    if (color === 'blue') bonus += buffs.filter(b => b.id === 'blue_lv3').length * 50;
    if (color === 'pink') bonus += buffs.filter(b => b.id === 'pink_lv3').length * 50;
    return bonus;
}
export function getComboBonus(buffs) {
    return buffs.filter(b => b.id === 'combo_lv3').length * 0.2;
}
export function getFreqBonus(buffs) {
    return buffs.filter(b => b.id === 'freq_lv3').length * 0.25;
}
export function getSpeedBonus(buffs) {
    return buffs.filter(b => b.id === 'speed_lv3').length * 2.0;
}

export function getYellowPriceMultiplier(buffs) {
    const count = buffs.filter(b => b.id === 'yellow_x3').length;
    return Math.pow(3, count);
}

export function getYellowChanceOverride(buffs) {
    return buffs.some(b => b.id === 'locust_lv3') ? 0.6 : 0;
}

export function getComboThreshold(buffs) {
    // 如果有手感爆棚，阈值变为 2
    return buffs.some(b => b.id === 'combo_threshold_lv3') ? 2 : 999;
}