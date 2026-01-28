import React from 'react';

interface NewsItem {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  time: string;
}

const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    title: "Giá vàng SJC hôm nay bất ngờ đảo chiều tăng mạnh",
    subtitle: "Thị trường trong nước phản ứng nhanh với biến động từ New York, nhu cầu mua tích trữ tăng cao.",
    imageUrl: "https://images.unsplash.com/photo-1589750670744-dc963161a917?q=80&w=400&auto=format&fit=crop",
    time: "30 phút trước"
  },
  {
    id: 2,
    title: "Chuyên chuyên gia: Nên mua vàng nhẫn hay vàng miếng lúc này?",
    subtitle: "Phân tích biên độ chênh lệch và rủi ro thanh khoản giữa hai loại hình đầu tư phổ biến.",
    imageUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=400&auto=format&fit=crop",
    time: "2 giờ trước"
  },
  {
    id: 3,
    title: "Đồng USD suy yếu hỗ trợ đà phục hồi của vàng thế giới",
    subtitle: "Chỉ số DXY giảm sâu sau báo cáo lạm phát Mỹ, mở đường cho vàng tái lập mốc kỷ lục.",
    imageUrl: "https://images.unsplash.com/photo-1502920513543-d0381d76e5d4?q=80&w=400&auto=format&fit=crop",
    time: "4 giờ trước"
  },
  {
    id: 4,
    title: "Sôi động thị trường vàng nhẫn trước ngày Thần Tài",
    subtitle: "Các doanh nghiệp lớn tung ra nhiều mẫu mã mới, lượng khách đặt trước tăng 30% so với năm ngoái.",
    imageUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=400&auto=format&fit=crop",
    time: "5 giờ trước"
  }
];

export const GoldNews: React.FC = () => {
  return (
    <div className="bg-white border-y border-gray-200 py-4 px-4 sm:border-none">
      <div className="flex items-center justify-between mb-4">
        {/* Section title matched to Chart Title style (text-lg font-serif) */}
        <h3 className="text-lg font-bold text-gray-900 font-serif">
          Tin tức thị trường
        </h3>
      </div>

      <div className="flex flex-col">
        {NEWS_DATA.map((news, index) => (
          <div 
            key={news.id} 
            className={`flex gap-4 group cursor-pointer py-4 first:pt-0 last:pb-0 ${
              index !== NEWS_DATA.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            {/* Image Section - Fixed 5:3 Ratio, 140px width */}
            <div className="w-[140px] shrink-0">
              <div className="aspect-[5/3] overflow-hidden bg-gray-100 rounded-sm relative">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Text Section - Top aligned */}
            <div className="flex-1 flex flex-col justify-start">
              <div>
                {/* Reduced font size to 16px for better mobile readability */}
                <h4 className="font-serif font-bold text-[16px] leading-[22px] text-gray-900 group-hover:text-vne-red transition-colors">
                  {news.title}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};