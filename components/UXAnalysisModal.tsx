import React from 'react';
import { X, CheckCircle, AlertCircle, Layout, Smartphone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UXAnalysisModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Phân Tích & Cải Thiện UX</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          
          {/* Section 1: Weaknesses */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold text-red-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              Điểm yếu giao diện cũ (User Pain Points)
            </h3>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="bg-red-50 p-4 rounded-lg border border-red-100">
                <strong className="block text-red-800 mb-1">1. Quá tải thông tin số (Cognitive Load)</strong>
                <p className="text-sm text-gray-700">Người dùng phải nhìn 4 cột số và tự làm phép trừ trong đầu để biết giá tăng hay giảm. Không có chỉ báo trực quan (màu sắc, mũi tên) cho toàn bộ bảng.</p>
              </li>
              <li className="bg-red-50 p-4 rounded-lg border border-red-100">
                <strong className="block text-red-800 mb-1">2. Thiếu phân cấp thị giác</strong>
                <p className="text-sm text-gray-700">Giá vàng thế giới, SJC, và vàng nữ trang hiển thị giống hệt nhau. Người dùng khó quét nhanh loại vàng mình quan tâm.</p>
              </li>
              <li className="bg-red-50 p-4 rounded-lg border border-red-100">
                <strong className="block text-red-800 mb-1">3. Trải nghiệm Mobile kém</strong>
                <p className="text-sm text-gray-700">Bảng dữ liệu nhiều cột (7 cột) thường bị vỡ hoặc phải cuộn ngang trên điện thoại, làm mất ngữ cảnh tên sản phẩm khi xem giá.</p>
              </li>
              <li className="bg-red-50 p-4 rounded-lg border border-red-100">
                <strong className="block text-red-800 mb-1">4. Thiếu tính năng giữ chân (Time-on-site)</strong>
                <p className="text-sm text-gray-700">Chỉ hiển thị dữ liệu tĩnh, không có công cụ hỗ trợ người dùng "hành động" (tính toán, so sánh).</p>
              </li>
            </ul>
          </section>

          {/* Section 2: Solutions */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-bold text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              Giải pháp đã thực hiện (Improvements)
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0 bg-green-100 p-2 rounded-lg h-fit text-green-700"><Layout className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Tính toán & Trực quan hóa tự động</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Hệ thống tự động tính chênh lệch giữa Hôm nay và Hôm qua. Sử dụng màu sắc (Xanh/Đỏ) và Mũi tên để người dùng biết ngay xu hướng thị trường trong <span className="font-bold">0.5 giây</span> đầu tiên.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 bg-green-100 p-2 rounded-lg h-fit text-green-700"><Smartphone className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Chiến lược Mobile-First</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Trên Desktop dùng bảng chi tiết. Trên Mobile tự động chuyển sang dạng <strong>Card (Thẻ)</strong> giúp dễ đọc, nút bấm to rõ, tối ưu cho màn hình dọc.
                  </p>
                </div>
              </div>

               <div className="flex gap-4">
                <div className="shrink-0 bg-green-100 p-2 rounded-lg h-fit text-green-700"><CheckCircle className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-gray-900">SEO & Tiện ích</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Thêm bộ công cụ <strong>"Tính Giá Trị Vàng"</strong>. Đây là từ khóa SEO high-volume, giúp giữ chân người dùng lâu hơn trên trang thay vì chỉ xem giá rồi thoát.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};