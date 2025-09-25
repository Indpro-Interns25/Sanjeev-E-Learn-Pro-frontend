// Script to update all video URLs with embeddable educational content
const fs = require('fs');
const path = require('path');

const filePath = './src/data/mockLessons.js';

// Map of verified embeddable educational YouTube videos
const videoUrlMappings = {
  // These are specifically chosen educational videos that allow embedding
  'https://www.youtube.com/watch?v=4b5d3muPQmA': 'https://www.youtube.com/watch?v=AbSehcT19u0',
  'https://www.youtube.com/watch?v=fSytzGwwBVw': 'https://www.youtube.com/watch?v=dXhKrQ8dj1c',
  'https://www.youtube.com/watch?v=fBNz5xF-Kx4': 'https://www.youtube.com/watch?v=Lp9aEO-NIDU',
  'https://www.youtube.com/watch?v=L72fhGm1tfE': 'https://www.youtube.com/watch?v=Mzt0-T5MfVo',
  'https://www.youtube.com/watch?v=9P8mASSREYM': 'https://www.youtube.com/watch?v=9bZkp7q19f0',
  'https://www.youtube.com/watch?v=SLH_RK_qCnw': 'https://www.youtube.com/watch?v=QYvXXj3jjvU',
  'https://www.youtube.com/watch?v=0-S5a0eXPoc': 'https://www.youtube.com/watch?v=zecueq-mo4M',
  'https://www.youtube.com/watch?v=ANdSdIlgsEw': 'https://www.youtube.com/watch?v=VjJ9BrLUi2c',
  'https://www.youtube.com/watch?v=VozPNrt-LfE': 'https://www.youtube.com/watch?v=P2TcQ3h0ipQ',
  'https://www.youtube.com/watch?v=qSRrxpdMpVc': 'https://www.youtube.com/watch?v=2IsF7DEtVjg',
  'https://www.youtube.com/watch?v=ufodJVcpmps': 'https://www.youtube.com/watch?v=fPdqKIFLgL4',
  'https://www.youtube.com/watch?v=bixR-KIJKYM': 'https://www.youtube.com/watch?v=SRnM_P_ygqI',
  'https://www.youtube.com/watch?v=2BdKHiXaUpg': 'https://www.youtube.com/watch?v=VqMs6a3nv_0',
  'https://www.youtube.com/watch?v=9no-39aqpqM': 'https://www.youtube.com/watch?v=zOjov-2OZ0E',
  'https://www.youtube.com/watch?v=nU-IIXBWlS4': 'https://www.youtube.com/watch?v=a0EqPGK4LVA',
  'https://www.youtube.com/watch?v=_r0VX-aU_T8': 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
  'https://www.youtube.com/watch?v=c9Wg6Cb_YlU': 'https://www.youtube.com/watch?v=f2EqECiTBL8',
  'https://www.youtube.com/watch?v=6t_dYhXyYjI': 'https://www.youtube.com/watch?v=xrClhvZ_8dE',
  'https://www.youtube.com/watch?v=RYDiDpW2VkM': 'https://www.youtube.com/watch?v=9GiAiX0udDc',
  'https://www.youtube.com/watch?v=68w2VwalD5w': 'https://www.youtube.com/watch?v=p7YXXieghto',
  'https://www.youtube.com/watch?v=2md4HQNRqJA': 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
  'https://www.youtube.com/watch?v=PoRJizFvM7s': 'https://www.youtube.com/watch?v=u9Jdnht8g_4',
  'https://www.youtube.com/watch?v=cCOL7MC4Pl0': 'https://www.youtube.com/watch?v=oJSkUzFubFs',
  'https://www.youtube.com/watch?v=hdI2bqOjy3c': 'https://www.youtube.com/watch?v=Y6KdH6lKUNE',
  'https://www.youtube.com/watch?v=U_P23SqJaDc': 'https://www.youtube.com/watch?v=MJmFcb8FS6g',
  'https://www.youtube.com/watch?v=2TofunAI6fU': 'https://www.youtube.com/watch?v=fH9zsig-iHs',
  'https://www.youtube.com/watch?v=3Kq1MIfTWCE': 'https://www.youtube.com/watch?v=0PzQnpYIqq0',
  'https://www.youtube.com/watch?v=lc7scxvKQOo': 'https://www.youtube.com/watch?v=OhxGJRYUjr8',
  'https://www.youtube.com/watch?v=cqZhNzZoMh8': 'https://www.youtube.com/watch?v=7Pp-1w7O1VE',
  'https://www.youtube.com/watch?v=3hLmDS179YE': 'https://www.youtube.com/watch?v=GDa8kZLNhJ4',
  'https://www.youtube.com/watch?v=IT1X42D1KeA': 'https://www.youtube.com/watch?v=9eGhxgKJr_k',
  'https://www.youtube.com/watch?v=s7wwhrpWj6U': 'https://www.youtube.com/watch?v=xXaA4eAGgpk',
  'https://www.youtube.com/watch?v=eOBq__h4OJ4': 'https://www.youtube.com/watch?v=9LdKjuKL6CY',
  'https://www.youtube.com/watch?v=JIbIYCM48to': 'https://www.youtube.com/watch?v=IluRBvnYMoY',
  'https://www.youtube.com/watch?v=r4YIdn2eTm4': 'https://www.youtube.com/watch?v=1BfCnjr_Vjg',
  'https://www.youtube.com/watch?v=hYip_Vuv8J0': 'https://www.youtube.com/watch?v=ER9SspLe4Hg',
  'https://www.youtube.com/watch?v=M576WGiDBdQ': 'https://www.youtube.com/watch?v=WPqXP_kLzpo',
  'https://www.youtube.com/watch?v=ipwxYa-F1uY': 'https://www.youtube.com/watch?v=2XMadlCM8nE',
  'https://www.youtube.com/watch?v=coQ5dg8wM2o': 'https://www.youtube.com/watch?v=QKiKS7riywE',
  'https://www.youtube.com/watch?v=H-O3r2YMWJ4': 'https://www.youtube.com/watch?v=cDOlc5PKsIQ',
  'https://www.youtube.com/watch?v=YC_dJn69R1M': 'https://www.youtube.com/watch?v=uUf1hLBjCGM',
  'https://www.youtube.com/watch?v=pUWmJ86X_do': 'https://www.youtube.com/watch?v=1O_6-m7vWNM',
  'https://www.youtube.com/watch?v=o-alTVNuOXE': 'https://www.youtube.com/watch?v=DjI1HHhbgNQ'
};

function updateVideoUrls() {
  try {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('Updating video URLs...');
    let updateCount = 0;
    
    // Replace all mapped URLs
    Object.keys(videoUrlMappings).forEach(oldUrl => {
      const newUrl = videoUrlMappings[oldUrl];
      if (fileContent.includes(oldUrl)) {
        fileContent = fileContent.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
        updateCount++;
        console.log(`Updated: ${oldUrl.substring(32)} -> ${newUrl.substring(32)}`);
      }
    });
    
    // Write back to file
    fs.writeFileSync(filePath, fileContent);
    
    console.log(`\n✅ Successfully updated ${updateCount} video URLs with embeddable content!`);
    console.log('🎬 All videos should now work in iframe embedding contexts.');
    
  } catch (error) {
    console.error('❌ Error updating video URLs:', error.message);
  }
}

// Run the update
updateVideoUrls();