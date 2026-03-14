const filterByTimeframe = (date, tf) => {
    if (!date) return false;
    const now = new Date();
    const checkDate = new Date(date);
    
    // now.setHours(0,0,0,0); -> wait, `now` becomes today 00:00:00
    // checkDate is today, eg 14:00:00
    // diffMs = now - checkDate = negative
    // diffDays = negative
    // if diffDays <= 1, it's TRUE. So it should be included!

    now.setHours(0,0,0,0);
    const diffMs = now.getTime() - checkDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    console.log(`date: ${date}, diffDays: ${diffDays}, diffMs: ${diffMs}`);
    
    switch (tf) {
        case 'day': return diffDays <= 1; // Today
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'year': return diffDays <= 365;
        default: return true;
    }
};

filterByTimeframe(new Date(), 'day');
filterByTimeframe(new Date(Date.now() - 2*24*60*60*1000), 'day'); // 2 days ago
filterByTimeframe(new Date(Date.now() - 2*24*60*60*1000), 'week'); // 2 days ago
