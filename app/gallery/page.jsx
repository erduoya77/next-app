import Gallery from '@/app/components/GalleryClient';

export const metadata = {
  title: '照片墙 - 我的博客',
  description: '展示我的照片收藏',
};

export default async function GalleryPage() {
  const baseUrl = "https://pan.erduoya.top/";
  const apiUrl = "https://pan.erduoya.top/api/v2.1/share-links/5e8c9bbcbaf741e88ee7/dirents/";

  let images = [];
  try {
    const response = await fetch(apiUrl, { cache: 'no-store' }); // 禁用缓存，类似 getServerSideProps
    if (!response.ok) {
      throw new Error('获取图片列表失败');
    }
    const data = await response.json();
    images = data.dirent_list.filter(item => !item.is_dir); // 只获取图片文件

    // 预处理图片 URL
    images = images.map(item => ({
      ...item,
      displayUrl: baseUrl + item.encoded_thumbnail_src.replace("/48/", `/512/`),
      originalUrl: baseUrl + item.encoded_thumbnail_src.replace("/48/", "/2048/"),
    }));
  } catch (error) {
    console.error('获取图片列表失败:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">照片墙</h1>
      <Gallery images={images} />
    </div>
  );
}