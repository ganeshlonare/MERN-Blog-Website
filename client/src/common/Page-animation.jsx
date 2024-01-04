import {motion , AnimatePresence} from 'framer-motion'

export default function AnimationWrapper({children , keyValue , initial={opacity : 0} , animate={opacity : 1} , transition={duration : 0.5} , className }) {
  return (
    <AnimatePresence>
    <motion.div
    key={keyValue}
    initial={initial}
    animate={animate}
    transition={transition}
    className={className}
    >
      {children}
    </motion.div>
    </AnimatePresence>
  )
}
