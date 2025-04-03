package ru.ruslan.spring.diplom;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.ui.Model;

import java.util.List;

@SpringBootApplication
public class DiplomApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiplomApplication.class, args);

        System.out.println( "Application started" );



    }
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
