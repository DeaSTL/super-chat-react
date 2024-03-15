import {  ReactNode } from "react"
import { createPortal } from "react-dom"

type Props = {
  children:ReactNode
  show: boolean
}

export default function Modal({children,show}: Props) {
  return createPortal(
    <div className={show ? 'modal' : 'modal invisible'}>
      <div className="modal-body">
        {children}
      </div>
    </div>
    ,
    document.getElementById('root') as HTMLElement
  )

}
