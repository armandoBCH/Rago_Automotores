

export const slugify = (text: string): string => {
  if (!text) return '';
  
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export const optimizeUrl = (url: string, options: Record<string, any> = {}): string => {
    // Return a placeholder for invalid or non-http URLs
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return 'https://i.imgur.com/g2a4A0a.png';
    }

    try {
        new URL(url); // Validate the URL format to prevent errors
        const baseUrl = 'https://images.weserv.nl/?url=';
        
        // weserv.nl expects the URL without the protocol
        const cleanUrl = url.replace(/^https?:\/\//, '');
        
        const params = new URLSearchParams(options).toString();
        return `${baseUrl}${cleanUrl}&${params}`;
    } catch (e) {
        // If the URL is malformed, return the standard placeholder
        return 'https://i.imgur.com/g2a4A0a.png';
    }
};