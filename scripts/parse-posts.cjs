const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../_posts');
const OUTPUT_FILE = path.join(__dirname, '../src/posts-index.json');

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.md')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function parsePosts() {
    const files = getAllFiles(POSTS_DIR);
    const posts = files.map((filePath, index) => {
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);

        // Use relative path for loading in frontend
        const relativePath = path.relative(path.join(__dirname, '..'), filePath);

        return {
            id: index + 1,
            title: data.title || path.basename(filePath, '.md'),
            date: data.date ? new Date(data.date).toLocaleDateString() : '2026.01.01',
            category: data.category || 'Uncategorized',
            excerpt: data.description || content.slice(0, 150).replace(/[#*`]/g, '').trim() + '...',
            path: relativePath.replace(/\\/g, '/'),
            slug: path.basename(filePath, '.md').replace(/\s+/g, '-').toLowerCase()
        };
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
    console.log(`Successfully parsed ${posts.length} posts to ${OUTPUT_FILE}`);
}

parsePosts();
