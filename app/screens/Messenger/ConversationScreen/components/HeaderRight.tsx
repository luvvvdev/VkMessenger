import { useDispatch, useSelector } from "react-redux"
import { Dispatch, RootState } from "../../../../models"
import { Button } from "react-native"
import React from "react"

const HeaderRight = () => {
  const currentPeerId = useSelector<RootState, number | null>((state) => state.history.current_id)
  const dispatch = useDispatch<Dispatch>()

  if (!currentPeerId) return null

  const fullRefresh = () => {
    dispatch.history.clear({ peer_id: currentPeerId })
    dispatch.history.get({ peer_id: currentPeerId, offset: 0 })
  }

  return <Button title={"Clear"} onPress={fullRefresh} />
}

export default HeaderRight
