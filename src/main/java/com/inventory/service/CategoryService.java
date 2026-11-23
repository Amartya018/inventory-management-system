package com.inventory.service;

import com.inventory.dto.CategoryDto;
import com.inventory.entity.Category;
import com.inventory.exception.BusinessException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDto.Response> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CategoryDto.Response getCategoryById(Long id) {
        return toResponse(findById(id));
    }

    public CategoryDto.Response createCategory(CategoryDto.Request request) {
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new BusinessException("Category already exists: " + request.getCategoryName());
        }
        Category category = Category.builder()
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .build();
        return toResponse(categoryRepository.save(category));
    }

    public CategoryDto.Response updateCategory(Long id, CategoryDto.Request request) {
        Category category = findById(id);
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        return toResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", id);
        }
        categoryRepository.deleteById(id);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private CategoryDto.Response toResponse(Category c) {
        return CategoryDto.Response.builder()
                .id(c.getId())
                .categoryName(c.getCategoryName())
                .description(c.getDescription())
                .build();
    }
}
