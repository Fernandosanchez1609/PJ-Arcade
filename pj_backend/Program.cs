using Microsoft.EntityFrameworkCore;
using pj_backend.Models.Database.Repositories;
using pj_backend.Services;
using pj_backend.Models.Seeders;

namespace pj_backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var app = builder.Build();

            // Configuración de servicios
            ConfigureServices(builder);

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
               app.UseSwagger();
               app.UseSwaggerUI();
            }

            //Creacion de la base de datos y el seeder
            SeedDatabase(app.Services);



            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }

        private static void ConfigureServices(WebApplicationBuilder builder)
        {
          builder.Services.AddControllers();
          // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
          builder.Services.AddEndpointsApiExplorer();
          builder.Services.AddSwaggerGen();

          // Configuración de base de datos y repositorios
          builder.Services.AddScoped<AppDbContext>();
          builder.Services.AddScoped<UnitOfWork>();

          //inyeccion de servicios
          builder.Services.AddScoped<UserService>();
        }

        private static void SeedDatabase(IServiceProvider serviceProvider)
        {
          using var scope = serviceProvider.CreateScope();
          var dbContext = scope.ServiceProvider.GetService<AppDbContext>();

          if (dbContext.Database.EnsureCreated())
          {
            var seeder = new SeedManager(dbContext);
            seeder.SeedAll();
          }
        }
  }
}
