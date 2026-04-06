import React from 'react'
import { Button } from './ui/button'
import { useLoadUserQuery, useToggleCartMutation } from '@/features/api/authApi'
import { useCreateOrderMutation } from '@/features/api/purchaseApi'
import { toast } from 'sonner'
import { Loader2, ShoppingCart, Check, BookOpen } from 'lucide-react'

const BuyCourseButton = ({ courseId, coursePrice = 0 }) => {
  const { data: userData, refetch: refetchUser } = useLoadUserQuery();
  const user = userData?.user;

  const [toggleCart, { isLoading }] = useToggleCartMutation();
  const [createOrder, { isLoading: isFreeEnrollLoading }] = useCreateOrderMutation();

  const isEnrolled = user?.enrolledCourses?.includes(courseId) || user?.enrolledCourses?.some(c => c._id === courseId);
  const isInCart = user?.cart?.some(item => item.resourceId === courseId);
  const isFreeCourse = Number(coursePrice || 0) === 0;

  if (isEnrolled) return null;

  const handleGetFreeCourse = async () => {
    if (!user) {
      toast.error("Please login to proceed.");
      return;
    }
    try {
      const res = await createOrder({ resourceId: courseId, resourceType: 'course' }).unwrap();
      if (res.success) {
        toast.success("Course added to My Learning!");
        await refetchUser();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to unlock free course");
    }
  };

  const handleToggleCart = async () => {
    if (!user) {
      toast.error("Please login to proceed.");
      return;
    }
    try {
      const res = await toggleCart({ resourceId: courseId, resourceType: 'course' }).unwrap();
      if (res.success) {
        toast.success(res.message);
        await refetchUser();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update cart");
    }
  };

  return (
    <Button
      disabled={isLoading || isFreeEnrollLoading}
      onClick={isFreeCourse ? handleGetFreeCourse : handleToggleCart}
      variant={!isFreeCourse && isInCart ? "outline" : "default"}
      className={!isFreeCourse && isInCart ? 'w-full h-12 font-bold border-teal-600 text-teal-700 hover:bg-teal-50 shadow-none' : 'w-full bg-teal-600 hover:bg-teal-700 font-bold h-12 shadow-lg shadow-teal-50'}
    >
      {isLoading || isFreeEnrollLoading ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : isFreeCourse ? (
        <><BookOpen className='mr-2 h-5 w-5' /> Get Free Course</>
      ) : isInCart ? (
        <><Check className='mr-2 h-5 w-5' /> Added to Cart</>
      ) : (
        <><ShoppingCart className='mr-2 h-5 w-5' /> Add to Cart</>
      )}
    </Button>
  )
}

export default BuyCourseButton
