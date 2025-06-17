// Format "May 15, 2023"
export function formatMemberSince(dateString){
    if (!dateString) return 'No date';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'No date';
        
        const month = date.toLocaleDateString("default", { month: "long" });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'No date';
    }
}

// This format "May 15, 2025" for example
export function formatPublishDate(dateString){
    if (!dateString) return 'No date';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'No date';
        
        const month = date.toLocaleDateString("default", { month: "long" });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'No date';
    }
}