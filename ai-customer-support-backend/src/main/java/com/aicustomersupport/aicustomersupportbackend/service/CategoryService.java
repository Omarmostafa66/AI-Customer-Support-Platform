package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.Category;
import com.aicustomersupport.aicustomersupportbackend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Create Category
    public Category createCategory(Category category) {

        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category with this name already exists");
        }

        return categoryRepository.save(category);
    }

    // Get All Categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Get Category By ID
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Update Category
    public Category updateCategory(Long id, Category categoryDetails) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getName().equals(categoryDetails.getName())
                && categoryRepository.existsByName(categoryDetails.getName())) {

            throw new RuntimeException("Category with this name already exists");
        }

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());

        return categoryRepository.save(category);
    }

    // Delete Category
    public void deleteCategory(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        categoryRepository.delete(category);
    }
}