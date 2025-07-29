export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white p-4 rounded shadow relative max-w-full" onClick={e => e.stopPropagation()}>
        <button className="absolute top-1 right-1" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
