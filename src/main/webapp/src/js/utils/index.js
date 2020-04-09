function sleep(miliseconds) {
    return new Promise(res => setTimeout(() => res(), miliseconds));
}

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1)
};

export { capitalize, sleep }