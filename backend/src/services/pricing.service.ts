import prisma from '../prisma';

export interface CalculateFareParams {
  serviceType: 'FOOD' | 'EXPRESS' | 'MARKET' | 'SHOPPING' | string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  promoCode?: string;
  subtotal?: number; // for food/market/shopping item carts
}

export interface FareCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  serviceFee: number;
  subtotal: number;
  deliveryFee: number;
  surgeMultiplier: number;
  discount: number;
  totalAmount: number;
  driverEarnings: number;
  platformFee: number;
}

// Haversine formula for distance between 2 coordinates
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.max(0.5, Math.round(distance * 10) / 10); // Minimum 0.5 km
}

// Estimate driving duration in Cairo traffic (~25 km/h average)
export function estimateDurationMinutes(distanceKm: number): number {
  const avgSpeedKmH = 25;
  const minutes = (distanceKm / avgSpeedKmH) * 60;
  return Math.max(5, Math.round(minutes)); // Minimum 5 mins
}

export async function calculateFare(
  params: CalculateFareParams
): Promise<FareCalculationResult> {
  const distanceKm = calculateDistanceKm(
    params.pickupLat,
    params.pickupLng,
    params.dropoffLat,
    params.dropoffLng
  );
  const durationMinutes = estimateDurationMinutes(distanceKm);

  // Retrieve pricing rule from DB or fall back to Egyptian delivery defaults
  let rule = await prisma.pricingRule.findFirst({
    where: {
      serviceType: params.serviceType,
      isActive: true,
    },
  });

  const baseFare = rule?.baseFare ?? 20.0;
  const perKmRate = rule?.perKmRate ?? 4.5;
  const perMinuteRate = rule?.perMinuteRate ?? 1.0;
  const minimumFare = rule?.minimumFare ?? 25.0;
  const serviceFee = rule?.serviceFee ?? 5.0;
  const surgeMultiplier = rule?.surgeMultiplier ?? 1.0;
  const driverCommissionPercent = rule?.driverCommissionPercent ?? 15.0;

  let distanceFare = distanceKm * perKmRate;
  let timeFare = durationMinutes * perMinuteRate;
  let rawDeliveryOrRide = (baseFare + distanceFare + timeFare) * surgeMultiplier;

  if (rawDeliveryOrRide < minimumFare) {
    rawDeliveryOrRide = minimumFare;
  }

  const subtotal = params.subtotal || 0;
  const deliveryFee = Math.round(rawDeliveryOrRide);

  // Discount calculation
  let discount = 0;
  if (params.promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: params.promoCode.toUpperCase() },
    });

    if (
      promo &&
      promo.isActive &&
      new Date() <= promo.expiryDate &&
      promo.usedCount < promo.usageLimit
    ) {
      const applicableAmount = subtotal > 0 ? (subtotal + deliveryFee) : deliveryFee;
      if (applicableAmount >= promo.minOrderAmount) {
        const calculatedDiscount = (applicableAmount * promo.discountPercent) / 100;
        discount = Math.min(calculatedDiscount, promo.maxDiscount);
      }
    }
  }

  const totalAmount = Math.max(
    0,
    Math.round((subtotal + deliveryFee + serviceFee - discount) * 100) / 100
  );

  // Commission & Driver earnings
  const platformFee = Math.round(((deliveryFee * driverCommissionPercent) / 100 + serviceFee) * 100) / 100;
  const driverEarnings = Math.max(0, Math.round((deliveryFee - (deliveryFee * driverCommissionPercent) / 100) * 100) / 100);

  return {
    distanceKm,
    durationMinutes,
    baseFare,
    distanceFare: Math.round(distanceFare * 100) / 100,
    timeFare: Math.round(timeFare * 100) / 100,
    serviceFee,
    subtotal,
    deliveryFee,
    surgeMultiplier,
    discount: Math.round(discount * 100) / 100,
    totalAmount,
    driverEarnings,
    platformFee,
  };
}
