export default function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
