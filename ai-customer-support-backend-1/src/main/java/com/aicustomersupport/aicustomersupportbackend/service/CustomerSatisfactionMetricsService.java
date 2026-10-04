package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.dto.CustomerSatisfactionMetricsResponse;
import com.aicustomersupport.aicustomersupportbackend.entity.CustomerSatisfaction;
import com.aicustomersupport.aicustomersupportbackend.repository.CustomerSatisfactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerSatisfactionMetricsService {

    private final CustomerSatisfactionRepository satisfactionRepository;

    public CustomerSatisfactionMetricsService(
            CustomerSatisfactionRepository satisfactionRepository
    ) {
        this.satisfactionRepository = satisfactionRepository;
    }

    public CustomerSatisfactionMetricsResponse getMetrics() {

        List<CustomerSatisfaction> satisfactions =
                satisfactionRepository.findAll();

        CustomerSatisfactionMetricsResponse response =
                new CustomerSatisfactionMetricsResponse();

        long fiveStarCount = 0;
        long fourStarCount = 0;
        long threeStarCount = 0;
        long twoStarCount = 0;
        long oneStarCount = 0;

        long ratingTotal = 0;
        long validRatingCount = 0;

        for (CustomerSatisfaction satisfaction : satisfactions) {

            Integer rating = satisfaction.getRating();

            if (rating == null) {
                continue;
            }

            ratingTotal += rating;
            validRatingCount++;

            switch (rating) {
                case 5 -> fiveStarCount++;
                case 4 -> fourStarCount++;
                case 3 -> threeStarCount++;
                case 2 -> twoStarCount++;
                case 1 -> oneStarCount++;
            }
        }

        double averageRating = validRatingCount == 0
                ? 0.0
                : (double) ratingTotal / validRatingCount;

        averageRating =
                Math.round(averageRating * 100.0) / 100.0;

        response.setTotalRatings(validRatingCount);
        response.setAverageRating(averageRating);
        response.setFiveStarCount(fiveStarCount);
        response.setFourStarCount(fourStarCount);
        response.setThreeStarCount(threeStarCount);
        response.setTwoStarCount(twoStarCount);
        response.setOneStarCount(oneStarCount);

        return response;
    }
}