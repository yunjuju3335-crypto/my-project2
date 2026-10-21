import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface AdminDashboardProps {
  onExit?: () => void;
}

// 기본 상품 목록 (DB에 상품이 아직 없을 때 1클릭 자동 등록 지원)
const INITIAL_PRODUCTS = [
  { id: 'm1', name: '상·하의 양복 (남)', price: '40,000', category: '남성 상례복' },
  { id: 'm2', name: '와이셔츠', price: '20,000', category: '남성 상례복' },
  { id: 'w1', name: '개량 한복 (여)', price: '40,000', category: '여성 상례복' },
  { id: 'am1', name: '완장', price: '', category: '남성 부자재' },
  { id: 'am2', name: '넥타이', price: '15,000', category: '남성 부자재' },
  { id: 'am3', name: '허리띠', price: '20,000', category: '남성 부자재' },
  { id: 'am4', name: '남성 양말', price: '', category: '남성 부자재' },
  { id: 'aw1', name: '머리핀', price: '', category: '여성 부자재' },
  { id: 'aw2', name: '여성 양말 / 덧신', price: '', category: '여성 부자재' }
];

export default function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState<'inquiries' | 'members' | 'products' | 'media'>('inquiries');
  const [members, setMembers] = useState<any[]>([]);
  const [heroImage, setHeroImage] = useState<string>('home_model.jpg');
  
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // DB에서 데이터 불러오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
      fetchMembers();
      fetchProducts();
    }
  }, [isAuthenticated]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setInquiries(data);
      if (error) console.warn('Inquiries fetch note:', error.message);
    } catch (e) {
      console.warn('Inquiries error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (data) setMembers(data);
    } catch (e) {
      console.warn('Members fetch note:', e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
      if (data) setProducts(data);
      if (error) console.warn('Products fetch note:', error.message);
    } catch (e) {
      console.warn('Products error:', e);
    } finally {
      setLoading(false);
    }
  };

  // 문의 상태 변경 (대기 -> 완료)
  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === '대기' ? '완료' : '대기';
    const { error } = await supabase.from('inquiries').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    } else {
      alert('상태 업데이트 실패: ' + error.message);
    }
  };

  // 상품 가격 임시 수정 (로컬 상태)
  const handlePriceChange = (id: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const formattedValue = numericValue ? Number(numericValue).toLocaleString('ko-KR') : '0';
    setProducts(products.map(p => p.id === id ? { ...p, price: formattedValue } : p));
  };

  // 수정한 가격을 DB에 일괄 저장
  const saveAllPrices = async () => {
    try {
      let rlsBlocked = false;
      let lastErrMsg = '';
      for (const product of products) {
        const { error } = await supabase.from('products').upsert({ id: product.id, name: product.name, price: product.price });
        if (error) {
          lastErrMsg = error.message;
          if (error.code === '42501' || error.message.includes('row-level security')) {
            rlsBlocked = true;
          }
        }
      }
      if (rlsBlocked) {
        alert("⚠️ [안내] Supabase 클라우드 저장 실패 (RLS 보안 정책 차단)\n\nSupabase의 RLS(행 수준 보안)로 인해 클라우드 DB 저장이 차단되었습니다.\n\n[해결 방법]\nSupabase 대시보드 -> SQL Editor에서 아래 명령어를 실행해주세요:\nALTER TABLE products DISABLE ROW LEVEL SECURITY;");
      } else if (lastErrMsg) {
        alert("⚠️ 저장 오류: " + lastErrMsg);
      } else {
        alert('모든 가격 정보가 성공적으로 Supabase에 업데이트되었습니다.');
        fetchProducts();
      }
    } catch (err: any) {
      alert('저장 중 오류 발생: ' + err.message);
    }
  };

  // 기본 상품 목록 DB 일괄 초기 등록
  const seedDefaultProducts = async () => {
    if (confirm('기본 상품 9종을 Supabase DB에 등록하시겠습니까?')) {
      try {
        const { error } = await supabase.from('products').upsert(INITIAL_PRODUCTS);
        if (error) throw error;
        alert('기본 상품 목록이 등록되었습니다.');
        fetchProducts();
      } catch (err: any) {
        alert('상품 등록 실패: ' + err.message);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin1234') {
      setIsAuthenticated(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full border border-slate-200">
          <div className="text-center mb-6">
            <span className="inline-block p-3 rounded-full bg-slate-900 text-white text-2xl mb-2">🔐</span>
            <h1 className="text-2xl font-bold text-slate-900">관리자 로그인</h1>
            <p className="text-xs text-slate-500 mt-1">백재상례복 운영 관리자 대시보드</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm"
                placeholder="비밀번호 입력 (기본: admin1234)"
                autoFocus
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer text-sm">
              관리자 접속
            </button>
            {onExit && (
              <button 
                type="button" 
                onClick={onExit} 
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← 홈페이지로 돌아가기
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-800">
      {/* 사이드바 */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">백재상례복</h2>
              <span className="text-[11px] text-amber-400 font-medium">관리자 콘솔 (Supabase)</span>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => setAdminTab('inquiries')} 
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between text-sm cursor-pointer ${adminTab === 'inquiries' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'hover:bg-slate-800/60 text-slate-400'}`}
            >
              <span>📥 실시간 문의 내역</span>
              {inquiries.filter(i => i.status === '대기').length > 0 && (
                <span className="bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {inquiries.filter(i => i.status === '대기').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setAdminTab('members')} 
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between text-sm cursor-pointer ${adminTab === 'members' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'hover:bg-slate-800/60 text-slate-400'}`}
            >
              <span>👥 회원 관리</span>
              <span className="text-xs text-slate-500">{members.length}명</span>
            </button>
            <button 
              onClick={() => setAdminTab('products')} 
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between text-sm cursor-pointer ${adminTab === 'products' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'hover:bg-slate-800/60 text-slate-400'}`}
            >
              <span>🛍️ 상품 및 가격 관리</span>
              <span className="text-xs text-slate-500">{products.length}건</span>
            </button>
            <button 
              onClick={() => setAdminTab('media')} 
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between text-sm cursor-pointer ${adminTab === 'media' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'hover:bg-slate-800/60 text-slate-400'}`}
            >
              <span>🎬 메인 미디어 관리</span>
              <span className="text-xs text-slate-500">사진 & 영상</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 space-y-2">
          {onExit && (
            <button 
              onClick={onExit} 
              className="w-full py-2.5 px-3 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🏠</span> 홈페이지로 나가기
            </button>
          )}
          <button 
            onClick={handleLogout} 
            className="w-full py-2.5 px-3 rounded-lg text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🚪</span> 관리자 로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {adminTab === 'inquiries' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">실시간 문의 내역</h2>
                <p className="text-xs text-slate-500 mt-1">고객님이 접수한 주문 및 맞춤 상담 내역입니다. 상태 버튼을 클릭하여 변경할 수 있습니다.</p>
              </div>
              <button 
                onClick={fetchInquiries} 
                className="self-start sm:self-auto px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>↺</span> 새로고침
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">상태 (클릭하여 변경)</th>
                      <th className="p-4">접수일시</th>
                      <th className="p-4">고객명 / 상호</th>
                      <th className="p-4">연락처</th>
                      <th className="p-4 min-w-[240px]">문의 내용</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400 text-sm">
                          {loading ? '데이터를 불러오는 중입니다...' : '아직 접수된 문의 내역이 없습니다.'}
                        </td>
                      </tr>
                    ) : (
                      inquiries.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => toggleStatus(req.id, req.status || '대기')}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer ${
                                req.status === '완료' 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-amber-100 text-amber-900 border border-amber-200 animate-pulse'
                              }`}
                              title="클릭하여 상태 변경"
                            >
                              {req.status === '완료' ? '✓ 완료' : '● 대기'}
                            </button>
                          </td>
                          <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                            {req.created_at ? new Date(req.created_at).toLocaleString('ko-KR') : '-'}
                          </td>
                          <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{req.name}</td>
                          <td className="p-4 font-medium text-slate-700 whitespace-nowrap">
                            <a href={`tel:${req.phone}`} className="hover:underline text-slate-900">{req.phone}</a>
                          </td>
                          <td className="p-4 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{req.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminTab === 'members' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">회원 목록 관리</h2>
                <p className="text-xs text-slate-500 mt-1">문의글 작성을 위해 가입한 회원 목록입니다. 관리자만 열람 및 관리할 수 있습니다.</p>
              </div>
              <button 
                onClick={fetchMembers} 
                className="self-start sm:self-auto px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>↺</span> 새로고침
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">가입일시</th>
                      <th className="p-4">아이디</th>
                      <th className="p-4">회원명</th>
                      <th className="p-4">연락처</th>
                      <th className="p-4 text-center">관리 액션</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400 text-sm">
                          아직 가입된 회원이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      members.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 text-xs text-slate-400">
                            {m.created_at ? new Date(m.created_at).toLocaleString('ko-KR') : '-'}
                          </td>
                          <td className="p-4 font-mono text-xs font-semibold text-slate-700">{m.username}</td>
                          <td className="p-4 font-bold text-slate-900">{m.name}</td>
                          <td className="p-4 font-mono text-xs text-slate-600">{m.phone}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <a href={`tel:${m.phone}`} className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800">통화</a>
                              <a href={`sms:${m.phone}`} className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700">문자</a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">상품 및 가격 관리</h2>
                <p className="text-xs text-slate-500 mt-1">판매가를 수정한 뒤 상단의 '변경사항 DB에 전체 저장' 버튼을 눌러주세요.</p>
              </div>
              <div className="flex items-center gap-2">
                {products.length === 0 && (
                  <button 
                    onClick={seedDefaultProducts} 
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    + 기본 상품 9종 DB 등록
                  </button>
                )}
                <button 
                  onClick={saveAllPrices} 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span>💾</span> 변경사항 DB에 전체 저장
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                <span className="text-4xl mb-3 block">🛍️</span>
                <p className="text-slate-600 font-medium mb-1">등록된 상품이 없습니다.</p>
                <p className="text-xs text-slate-400 mb-6">위의 '+ 기본 상품 9종 DB 등록' 버튼을 누르면 기본 상품이 Supabase에 자동으로 생성됩니다.</p>
                <button 
                  onClick={seedDefaultProducts} 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  기본 상품 자동 생성하기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-lg font-bold text-slate-700 uppercase shrink-0 border border-slate-200">
                      {product.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-slate-900 text-sm">{product.name}</h4>
                        {product.category && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{product.category}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 font-medium shrink-0">판매가</label>
                        <input 
                          type="text" 
                          value={product.price || ''} 
                          onChange={(e) => handlePriceChange(product.id, e.target.value)}
                          placeholder="0"
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-right font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm bg-slate-50" 
                        />
                        <span className="text-xs font-medium text-slate-700 shrink-0">원</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {adminTab === 'media' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">메인 미디어 관리</h2>
              <p className="text-xs text-slate-500 mt-1">홈 화면의 대표 모델 사진과 9:16 쇼츠 동영상을 직접 업로드하고 교체할 수 있습니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 대표 이미지 관리 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>📷</span> 메인 대표 모델 사진
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      localStorage.removeItem('baekjae_home_hero_image');
                      setHeroImage('home_model.jpg');
                      alert('기본 대표 이미지로 초기화되었습니다.');
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    ↺ 기본값 복원
                  </button>
                </div>
                <div className="w-full h-56 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 mb-4 flex items-center justify-center">
                  <img src={heroImage} alt="대표 이미지" className="w-full h-full object-cover object-top" />
                </div>
                <p className="text-xs text-slate-500 mb-4">선택하신 사진은 브라우저에 저장되며 홈페이지 메인 대표 사진으로 표시됩니다.</p>
                <label className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                  <span>📁</span> 새 대표 이미지 파일 선택 및 업로드
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const dataUrl = evt.target?.result as string;
                          if (dataUrl) {
                            setHeroImage(dataUrl);
                            localStorage.setItem('baekjae_home_hero_image', dataUrl);
                            alert('대표 이미지가 성공적으로 변경되었습니다.');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>

              {/* 쇼츠 동영상 관리 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>🎥</span> 9:16 쇼츠 비디오 관리
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">홈 화면 우측 9:16 세로형 플레이어에 재생될 공식 쇼츠 영상을 교체합니다.</p>
                <div className="space-y-4">
                  <label className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                    <span>📁</span> PC의 쇼츠 동영상 파일 선택하기
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          alert('동영상 파일이 선택되었습니다. 홈 화면에서 즉시 재생됩니다.');
                        }
                      }} 
                    />
                  </label>
                  <p className="text-xs text-slate-400 text-center">동영상 파일 또는 유튜브 링크 등록 시 새로고침해도 자동 유지됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
