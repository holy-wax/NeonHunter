export function getTimeBonus(buffs) {
    return buffs.filter(b => b.id === 'time_lv2').length * 10;
}
export function getPriceBonus(buffs, color) {
    let bonus = 0;
    if (color === 'blue') bonus += buffs.filter(b => b.id === 'blue_lv2').length * 30;
    if (color === 'pink') bonus += buffs.filter(b => b.id === 'pink_lv2').length * 30;
    return bonus;
}
export function getComboBonus(buffs) {
    return buffs.filter(b => b.id === 'combo_lv2').length * 0.15;
}
export function getFreqBonus(buffs) {
    return buffs.filter(b => b.id === 'freq_lv2').length * 0.15;
}
export function getSpeedBonus(buffs) {
    return buffs.filter(b => b.id === 'speed_lv2').length * 1.5;
}

export function canRecycleYellow(buffs) {
    return buffs.some(b => b.id === 'recycle');
}

export function getYellowChanceOverride(buffs) {
    return buffs.some(b => b.id === 'locust_lv2') ? 0.4 : 0;
}

export function getComboThreshold(buffs) {
    // 如果有手感火热，阈值变为 3
    return buffs.some(b => b.id === 'combo_threshold_lv2') ? 3 : 999;
}