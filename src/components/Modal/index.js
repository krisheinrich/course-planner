import React from 'react';

const Modal = React.forwardRef(({ children, id = '' }, ref) => (
  <div ref={ref} id={id} className="modal">
    { children }
  </div>
));

export default Modal;
