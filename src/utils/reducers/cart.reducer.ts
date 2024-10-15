import type { Discount } from "types/models";

export const SET_DISCOUNT = "SET_DISCOUNT";
export const SHOW_SUCCESS_MODAL = "SHOW_SUCCESS_MODAL";
export const CLOSE_SUCCESS_MODAL = "CLOSE_SUCCESS_MODAL";
export const SHOW_ERROR_MODAL = "SHOW_ERROR_MODAL";
export const CLOSE_ERROR_MODAL = "CLOSE_ERROR_MODAL";
export const SHOW_COUPON_MODAL = "SHOW_COUPON_MODAL";
export const CLOSE_COUPON_MODAL = "CLOSE_COUPON_MODAL";
export const TOGGLE_COUPON_MODAL = "TOGGLE_COUPON_MODAL";
export const TOGGLE_ERROR_MODAL = "TOGGLE_ERROR_MODAL";

export type RightBarState = {
  discount: Discount | null;
  showSuccessModal: boolean;
  showErrorModal: boolean;
  error: string;
  showCouponModal: boolean;
};

export type RightBarAction =
  | { type: typeof SET_DISCOUNT; payload: Discount | null }
  | { type: typeof SHOW_SUCCESS_MODAL }
  | { type: typeof CLOSE_SUCCESS_MODAL }
  | { type: typeof SHOW_ERROR_MODAL; payload: string }
  | { type: typeof CLOSE_ERROR_MODAL }
  | { type: typeof SHOW_COUPON_MODAL }
  | { type: typeof CLOSE_COUPON_MODAL }
  | { type: typeof TOGGLE_COUPON_MODAL }
  | { type: typeof TOGGLE_ERROR_MODAL };

export const rightBarInitialState: RightBarState = {
  discount: null,
  showSuccessModal: false,
  showErrorModal: false,
  error: "",
  showCouponModal: false,
};

export function rightBarReducer(state: RightBarState, action: RightBarAction): RightBarState {
  switch (action.type) {
    case SET_DISCOUNT:
      return { ...state, discount: action.payload };
    case SHOW_SUCCESS_MODAL:
      return { ...state, showSuccessModal: true };
    case CLOSE_SUCCESS_MODAL:
      return { ...state, showSuccessModal: false };
    case SHOW_ERROR_MODAL:
      return { ...state, showErrorModal: true, error: action.payload };
    case CLOSE_ERROR_MODAL:
      return { ...state, showErrorModal: false, error: "" };
    case TOGGLE_ERROR_MODAL:
      return { ...state, showErrorModal: !state.showErrorModal };
    case SHOW_COUPON_MODAL:
      return { ...state, showCouponModal: true };
    case CLOSE_COUPON_MODAL:
      return { ...state, showCouponModal: false };
    case TOGGLE_COUPON_MODAL:
      return { ...state, showCouponModal: !state.showCouponModal };
    default:
      return state;
  }
}
