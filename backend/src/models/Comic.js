// Comic model for PostgreSQL
export class Comic {
    constructor(id, title, description, imageUrl, s3Key, uploaderId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.s3Key = s3Key;
        this.uploaderId = uploaderId;
        this.views = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

// Mock comic data for development
export const mockComics = [
    new Comic(1, 'Sample Comic 1', 'Description 1', 'https://example.com/image1.jpg', 's3-key-1', 1),
    new Comic(2, 'Sample Comic 2', 'Description 2', 'https://example.com/image2.jpg', 's3-key-2', 2)
];
